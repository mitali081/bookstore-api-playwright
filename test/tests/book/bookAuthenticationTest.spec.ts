import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';
import { assertForbidden, assertUnauthorized } from '../../../src/utils/assertionHelpers';

type CreateBookRequest = {
  name: string | null;
  author: string | null;
  published_year: number;
  book_summary: string;
};

type ErrorResponseDetail = {
  type: string;
  msg: string;
};

type ErrorResponse = {
  detail: ErrorResponseDetail[];
};

const INVALID_TOKEN = 'Bearer invalidToken123';



async function postBook(apiRequest: any, book: CreateBookRequest, token: string) {
      return apiRequest.post(Endpoints.CREATE_BOOK, {
    data: book,
    headers: { Authorization: token },
  });
}

test.describe.serial('Book Authentication & Authorization Tests', { tag: ['@module-book-auth'] }, () => {
  let sharedAuthToken: string;

  test.beforeAll(async ({ userContext, apiRequest, authContext }) => {
    // Create a shared user for authentication tests
    TestDataFactory.populateUserContext(userContext);
    const sharedUserEmail = userContext.getEmail();
    const sharedUserPassword = userContext.getPassword();

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { 
      data: { email: sharedUserEmail, password: sharedUserPassword } 
    });
    expect(signUpResponse.status()).toBe(200);

    // Login and store token
    await authContext.login(apiRequest, sharedUserEmail, sharedUserPassword);
    sharedAuthToken = authContext.getToken();
    expect(sharedAuthToken).toBeTruthy();
  });

  test('GET Endpoints.CREATE_BOOK should require authentication', { tag: ['@tc-015'] }, async ({ apiRequest }) => {
    const response = await apiRequest.get(Endpoints.CREATE_BOOK);
    await assertUnauthorized(response, 'GET Books', test.info());
  });

  test('POST Endpoints.CREATE_BOOK should require authentication', { tag: ['@tc-016'] }, async ({ apiRequest }) => {
    const bookData = TestDataFactory.createTestBook();
    const response = await apiRequest.post(Endpoints.CREATE_BOOK, { data: bookData });
    await assertUnauthorized(response, 'POST Book', test.info());
  });

  test('GET Endpoints.CREATE_BOOK{id} should require authentication', { tag: ['@tc-017'] }, async ({ apiRequest }) => {
    const response = await apiRequest.get(Endpoints.GET_BOOK(1));
    await assertUnauthorized(response, 'GET Book by ID', test.info());
  });

  test('PUT Endpoints.CREATE_BOOK{id} should require authentication', { tag: ['@tc-018'] }, async ({ apiRequest }) => {
    const bookData = TestDataFactory.createTestBook();
    const response = await apiRequest.put(Endpoints.UPDATE_BOOK(1), { data: bookData });
    await assertUnauthorized(response, 'PUT Book', test.info());
  });

  test('DELETE Endpoints.CREATE_BOOK{id} should require authentication', { tag: ['@tc-019'] }, async ({ apiRequest }) => {
    const response = await apiRequest.delete(Endpoints.DELETE_BOOK(1));
    await assertUnauthorized(response, 'DELETE Book', test.info());
  });

  test('Book endpoints should reject invalid JWT tokens', { tag: ['@tc-020'] }, async ({ apiRequest }) => {
    const invalidTokens = [
      'Bearer invalid-token',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
      'Bearer ',
      'invalid-token-without-bearer',
    ];

    const bookData = TestDataFactory.createTestBook();

    for (const token of invalidTokens) {
      const postResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
        data: bookData,
        headers: { Authorization: token }
      });
      await assertForbidden(postResponse, 'POST Book with invalid token', test.info());

      const getResponse = await apiRequest.get(Endpoints.CREATE_BOOK, {
        headers: { Authorization: token }
      });
      await assertForbidden(getResponse, 'GET Books with invalid token', test.info());

      const getByIdResponse = await apiRequest.get(Endpoints.GET_BOOK(1), {
        headers: { Authorization: token }
      });
      await assertForbidden(getByIdResponse, 'GET Book by ID with invalid token', test.info());

      const putResponse = await apiRequest.put(Endpoints.UPDATE_BOOK(1), {
        data: bookData,
        headers: { Authorization: token }
      });
      await assertForbidden(putResponse, 'PUT Book with invalid token', test.info());

      const deleteResponse = await apiRequest.delete(Endpoints.DELETE_BOOK(1), {
        headers: { Authorization: token }
      });
      await assertForbidden(deleteResponse, 'DELETE Book with invalid token', test.info());
    }
  });

  test('Book endpoints should work with valid authentication', { tag: ['@smoke', '@tc-021'] }, async ({ userContext, authContext, apiRequest, cleanupContext }) => {
    TestDataFactory.populateUserContext(userContext);
    
    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
      data: { email: userContext.getEmail(), password: userContext.getPassword() }
    });
    expect(signUpResponse.status()).toBe(200);
    
    cleanupContext.addObject(userContext.getEmail(), 'user');

    await authContext.login(apiRequest, userContext.getEmail(), userContext.getPassword());
    expect(authContext.getToken()).toBeTruthy();

    const bookData = TestDataFactory.createTestBook();

    const createResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
      data: bookData,
      headers: authContext.getAuthHeaders()
    });
    expect(createResponse.status()).toBe(200);
    
    const createdBook = await createResponse.json();
    expect(createdBook.name).toBe(bookData.name);
    expect(createdBook.author).toBe(bookData.author);
    
    cleanupContext.addObject(createdBook.id.toString(), 'book');

    const getAllResponse = await apiRequest.get(Endpoints.CREATE_BOOK, {
      headers: authContext.getAuthHeaders()
    });
    expect(getAllResponse.status()).toBe(200);
    
    const allBooks = await getAllResponse.json();
    expect(Array.isArray(allBooks)).toBe(true);

    const getByIdResponse = await apiRequest.get(Endpoints.GET_BOOK(createdBook.id), {
      headers: authContext.getAuthHeaders()
    });
    expect(getByIdResponse.status()).toBe(200);
    
    const retrievedBook = await getByIdResponse.json();
    expect(retrievedBook.id).toBe(createdBook.id);

    const updatedBookData = {
      ...bookData,
      name: bookData.name + ' (Updated)',
      author: bookData.author + ' (Updated)'
    };
    
    const updateResponse = await apiRequest.put(Endpoints.UPDATE_BOOK(createdBook.id), {
      data: updatedBookData,
      headers: authContext.getAuthHeaders()
    });
    
    if (updateResponse.status() !== 200) {
      console.log(`tc-021: Update failed for book ${createdBook.id}: ${updateResponse.status()}`);
      const errorBody = await updateResponse.text();
      console.log(`tc-021: Error body: ${errorBody}`);
    }
    
    expect(updateResponse.status()).toBe(200);
    
    const updatedBook = await updateResponse.json();
    expect(updatedBook.name).toBe(updatedBookData.name);

    const deleteResponse = await apiRequest.delete(Endpoints.DELETE_BOOK(createdBook.id), {
      headers: authContext.getAuthHeaders()
    });
    expect(deleteResponse.status()).toBe(200);
    
    cleanupContext.clear();
  });

  test('Book endpoints should handle malformed authorization headers', { tag: ['@tc-022'] }, async ({ apiRequest }) => {
    const malformedHeaders = [
      { 'Authorization': '' },
      { 'Authorization': 'Bearer' },
      { 'Authorization': 'Basic dXNlcjpwYXNz' },
      { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
    ];

    const bookData = TestDataFactory.createTestBook();

    for (const headers of malformedHeaders) {
      const postResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
        data: bookData,
        headers
      });
      expect(postResponse.status()).toBe(403);

      const getResponse = await apiRequest.get(Endpoints.CREATE_BOOK, { headers });
      expect(getResponse.status()).toBe(403);
    }
  });

  test('Create book with invalid token returns 403', { tag: ['@tc-023'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: 'Invalid Book',
      author: 'Author',
      published_year: 2000,
      book_summary: 'Invalid token test',
    };
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    await assertForbidden(response, 'Create Book', test.info());
  });

  test('Create book with null name returns 403', { tag: ['@tc-024'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: null,
      author: 'Author A',
      published_year: 1990,
      book_summary: 'Summary A',
    };
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    expect(response.status()).toBe(403);

    const errorResponse = (await response.json()) as ErrorResponse;
    expect(errorResponse.detail.length).toBeGreaterThan(0);
  });

  test('Create book with null author returns 403', { tag: ['@tc-025'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: 'Book B',
      author: null,
      published_year: 1990,
      book_summary: 'Summary B',
    };
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    expect(response.status()).toBe(403);

    const errorResponse = (await response.json()) as ErrorResponse;
    expect(errorResponse.detail.length).toBeGreaterThan(0);
  });

  test('Create book with invalid year (0) returns 403', { tag: ['@tc-026'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: 'Book C',
      author: 'Author C',
      published_year: 0,
      book_summary: 'Summary C',
    };
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    expect(response.status()).toBe(403);

    const errorResponse = (await response.json()) as ErrorResponse;
    expect(errorResponse.detail.length).toBeGreaterThan(0);
  });

  test('Create book with empty name returns 403', { tag: ['@tc-027'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: '',
      author: 'Author D',
      published_year: 2000,
      book_summary: 'Summary D',
    };
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    expect(response.status()).toBe(403);

    const errorResponse = (await response.json()) as ErrorResponse;
    expect(errorResponse.detail.length).toBeGreaterThan(0);
  });

  test('Create book with invalid data using data factory', { tag: ['@tc-028'] }, async ({ bookContext, apiRequest }) => {
    const invalidBookData = TestDataFactory.createInvalidBookData();
    
    const book: CreateBookRequest = {
      name: invalidBookData.name,
      author: invalidBookData.author,
      published_year: invalidBookData.published_year,
      book_summary: invalidBookData.book_summary,
    };
    
    const response = await postBook(apiRequest, book, INVALID_TOKEN);
    expect(response.status()).toBe(403);

    const errorResponse = (await response.json()) as ErrorResponse;
    expect(errorResponse.detail.length).toBeGreaterThan(0);
  });

  test('Get book by invalid ID returns 403', { tag: ['@tc-029'] }, async ({ apiRequest }) => {
    const response = await apiRequest.get(Endpoints.GET_BOOK(999999), {
      headers: { Authorization: INVALID_TOKEN },
    });
    expect(response.status()).toBe(403);
  });

  test('Update non-existent book returns 403', { tag: ['@tc-030'] }, async ({ apiRequest }) => {
    const book: CreateBookRequest = {
      name: 'Non-existent Book',
      author: 'Author',
      published_year: 2000,
      book_summary: 'Update non-existent book test',
    };
    const response = await apiRequest.put(Endpoints.UPDATE_BOOK(999999), {
      data: book,
      headers: { Authorization: INVALID_TOKEN },
    });
    expect(response.status()).toBe(403);
  });

  test('Delete non-existent book returns 403', { tag: ['@tc-031'] }, async ({ apiRequest }) => {
    const response = await apiRequest.delete(Endpoints.DELETE_BOOK(999999), {
      headers: { Authorization: INVALID_TOKEN },
    });
    expect(response.status()).toBe(403);
  });

  test.afterEach(async ({ apiRequest, cleanupContext }) => {
    try {
      cleanupContext.sortByTimestamp();
      for (const [id, type] of cleanupContext.getObjects()) {
        if (type === 'book') {
          await apiRequest.delete(Endpoints.DELETE_BOOK(id), {
            headers: { Authorization: `Bearer ${sharedAuthToken}` }
          });
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  });


}); 