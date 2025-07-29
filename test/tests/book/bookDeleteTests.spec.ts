import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';
import { assertNotFound } from '../../../src/utils/assertionHelpers';
import { CreateBookRequest } from '../../../src/model/book/CreateBookRequest';
import { CreateBookResponse } from '../../../src/model/book/CreateBookResponse';

test.describe.serial('Book Delete Tests', { tag: ['@module-book', '@delete-tests'] }, () => {
  let userEmail: string;
  let userPassword: string;
  let authToken: string;
  let sharedBookId: number | null = null;

  test.beforeAll(async ({ apiRequest, authContext, userContext, bookContext }) => {
    // Create unique user and authenticate
    TestDataFactory.populateUserContext(userContext);
    userEmail = userContext.getEmail();
    userPassword = userContext.getPassword();
    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
      data: { email: userEmail, password: userPassword }
    });
    expect(signUpResponse.status()).toBe(200);
    // Login and store token
    await authContext.login(apiRequest, userEmail, userPassword);
    authToken = authContext.getToken();
    expect(authToken).toBeTruthy();

    // Create a shared book for both tests
    TestDataFactory.populateBookContext(bookContext);
    const deleteTestBookData: CreateBookRequest = {
      name: bookContext.getName(),
      author: bookContext.getAuthor(),
      published_year: bookContext.getPublishedYear(),
      book_summary: bookContext.getBookSummary(),
    };
    
    const createResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
      data: deleteTestBookData,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdBook = await createResponse.json() as CreateBookResponse;
    sharedBookId = createdBook.id;
  });

  test('Delete book by ID', { tag: ['@smoke', '@tc-013'] }, async ({ apiRequest }) => {
    expect(sharedBookId).toBeDefined();
    expect(sharedBookId).not.toBeNull();

    const response = await apiRequest.delete(Endpoints.DELETE_BOOK(sharedBookId!), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.message).toBe('Book deleted successfully');
  });

  test('Verify deleted book returns 404', { tag: ['@tc-014'] }, async ({ apiRequest }) => {
    // This test depends on tc-013 and uses the same book that was deleted
    expect(sharedBookId).toBeDefined();
    expect(sharedBookId).not.toBeNull();
    
    // Now verify 404 - need to include auth headers since API requires authentication
    const response = await apiRequest.get(Endpoints.GET_BOOK(sharedBookId!), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`tc-014: Response status: ${response.status()}`);
    if (response.status() !== 404) {
      const responseBody = await response.json();
      console.log(`tc-014: Response body:`, responseBody);
    }
    await assertNotFound(response, 'GET Deleted Book', test.info());
  });
}); 