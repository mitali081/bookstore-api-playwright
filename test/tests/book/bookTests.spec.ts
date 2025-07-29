import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';
import { assertNotFound } from '../../../src/utils/assertionHelpers';

type CreateBookRequest = {
  name: string;
  author: string;
  published_year: number;
  book_summary: string;
};

type CreateBookResponse = CreateBookRequest & { id: number };

test.describe('Book API Tests', { tag: ['@module-book'] }, () => {
  let userEmail: string;
  let userPassword: string;
  let authToken: string;
  let bookData: CreateBookRequest;

  const expectBookToMatch = (actual: CreateBookResponse, expected: CreateBookRequest | CreateBookResponse) => {
    expect(actual.name).toBe(expected.name);
    expect(actual.author).toBe(expected.author);
    expect(actual.published_year).toBe(expected.published_year);
    expect(actual.book_summary).toBe(expected.book_summary);
  };

  test.beforeAll(async ({ apiRequest, authContext, userContext }) => {
    // Create unique user
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
  });

  test.beforeEach(async ({ apiRequest, bookContext, cleanupContext }) => {
    // Create unique book
    TestDataFactory.populateBookContext(bookContext);
    bookData = {
      name: bookContext.getName(),
      author: bookContext.getAuthor(),
      published_year: bookContext.getPublishedYear(),
      book_summary: bookContext.getBookSummary(),
    };
    const createResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
      data: bookData,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdBook = await createResponse.json() as CreateBookResponse;

    // Add book ID to cleanup context
    cleanupContext.addObject(createdBook.id.toString(), 'book');

    bookContext.setBookData({
      id: createdBook.id,
      name: createdBook.name,
      author: createdBook.author,
      publishedYear: createdBook.published_year,
      bookSummary: createdBook.book_summary,
    });
  });

  test('Create book with valid data', { tag: ['@smoke', '@tc-009'] }, async ({ bookContext }) => {
    // Book is already created in beforeEach
    expect(bookContext.getId()).toBeDefined();
    expectBookToMatch({
      id: bookContext.getId(),
      name: bookContext.getName(),
      author: bookContext.getAuthor(),
      published_year: bookContext.getPublishedYear(),
      book_summary: bookContext.getBookSummary(),
    }, bookData);
  });

  test('Get book by ID and verify details', { tag: ['@smoke', '@tc-010'] }, async ({ apiRequest, bookContext }) => {
    const response = await apiRequest.get(Endpoints.GET_BOOK(bookContext.getId()), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();
    const book = await response.json() as CreateBookResponse;
    expect(book.id).toBe(bookContext.getId());
    expectBookToMatch(book, bookData);
  });

  test('Update book and verify updated details', { tag: ['@smoke', '@tc-011'] }, async ({ apiRequest, bookContext }) => {
    const updateBookRequest: CreateBookRequest = {
      name: bookContext.getName() + ' name update',
      author: bookContext.getAuthor() + ' author update',
      published_year: bookContext.getPublishedYear() + 2,
      book_summary: bookContext.getBookSummary() + ' summary update',
    };
    const response = await apiRequest.put(Endpoints.UPDATE_BOOK(bookContext.getId()), {
      data: updateBookRequest,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();
    const updatedBook = await response.json() as CreateBookResponse;
    expectBookToMatch(updatedBook, updateBookRequest);
  });

  test('Get all books and verify created book exists', { tag: ['@smoke', '@tc-012'] }, async ({ apiRequest, bookContext }) => {
    const response = await apiRequest.get(Endpoints.CREATE_BOOK, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();
    const books = await response.json() as CreateBookResponse[];
    const foundBook = books.find(b => b.id === bookContext.getId());
    expect(foundBook).toBeDefined();
    expectBookToMatch(foundBook!, bookData);
  });

  test.afterEach(async ({ apiRequest, cleanupContext }) => {
    // Clean up created objects
    try {
      cleanupContext.sortByTimestamp();
      for (const [id, type] of cleanupContext.getObjects()) {
        if (type === 'book') {
          await apiRequest.delete(Endpoints.DELETE_BOOK(id), {
            headers: { Authorization: `Bearer ${authToken}` }
          });
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  });


});
