import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';

test.describe('Book Error Response & Data Validation Tests', { tag: ['@module-book-error'] }, () => {
  let sharedUserEmail: string;
  let sharedUserPassword: string;
  let sharedAuthToken: string;

  test.beforeAll(async ({ userContext, apiRequest, authContext }) => {
    TestDataFactory.populateUserContext(userContext);
    sharedUserEmail = userContext.getEmail();
    sharedUserPassword = userContext.getPassword();

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { 
      data: { email: sharedUserEmail, password: sharedUserPassword } 
    });
    expect(signUpResponse.status()).toBe(200);

    await authContext.login(apiRequest, sharedUserEmail, sharedUserPassword);
    sharedAuthToken = authContext.getToken();
    expect(sharedAuthToken).toBeTruthy();
  });

  test('Book endpoints should handle malformed JSON', { tag: ['@tc-032'] }, async ({ apiRequest }) => {
    const response = await apiRequest.post(Endpoints.CREATE_BOOK, {
      data: '{"name": "Test Book", "author": "Test Author", "published_year": 2024,}',
      headers: {
        'Authorization': `Bearer ${sharedAuthToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    expect(response.status()).toBe(422);
  });

  test('Book endpoints should handle extra fields gracefully', { tag: ['@tc-033'] }, async ({ apiRequest }) => {
    const bookDataWithExtras = {
      name: 'Test Book',
      author: 'Test Author',
      published_year: 2024,
      book_summary: 'Test summary',
      extra_field: 'should be ignored',
      another_field: 123,
      nested_field: { key: 'value' }
    };

    const response = await apiRequest.post(Endpoints.CREATE_BOOK, {
      data: bookDataWithExtras,
      headers: { 'Authorization': `Bearer ${sharedAuthToken}` }
    });
    
    expect(response.status()).toBe(200);
    
    const createdBook = await response.json();
    expect(createdBook.name).toBe(bookDataWithExtras.name);
    expect(createdBook.author).toBe(bookDataWithExtras.author);
    expect(createdBook.published_year).toBe(bookDataWithExtras.published_year);
    expect(createdBook.book_summary).toBe(bookDataWithExtras.book_summary);
    
    expect(createdBook.extra_field).toBeUndefined();
    expect(createdBook.another_field).toBeUndefined();
    expect(createdBook.nested_field).toBeUndefined();
  });



}); 