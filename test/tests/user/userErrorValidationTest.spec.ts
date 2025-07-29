import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';

test.describe('User Error Response & Data Validation Tests', { tag: ['@module-user-error'] }, () => {
  test('User endpoints should handle special characters', { tag: ['@tc-034'] }, async ({ apiRequest }) => {
    const specialCharData = {
      email: `test+special-${Date.now()}@example.com`,
      password: 'StrongPassword123!@#$%^&*()',
    };
    
    const response = await apiRequest.post(Endpoints.SIGNUP, { data: specialCharData });
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.message).toBe('User created successfully');
  });

  test('User endpoints should handle case sensitivity', { tag: ['@tc-035'] }, async ({ apiRequest }) => {
    const userData = {
      email: `TestUser@Example.COM-${Date.now()}`,
      password: 'StrongPassword123!',
    };
    
    const signupResponse = await apiRequest.post(Endpoints.SIGNUP, { data: userData });
    expect(signupResponse.status()).toBe(200);

    const loginData = {
      email: userData.email.toLowerCase(),
      password: 'StrongPassword123!',
    };
    
    const loginResponse = await apiRequest.post(Endpoints.LOGIN, { data: loginData });
    
    expect(loginResponse.status()).toBe(400);
  });

  test('User endpoints should handle invalid data types', { tag: ['@tc-036'] }, async ({ apiRequest }) => {
    const invalidTypeData = {
      email: 123,
      password: 'StrongPassword123!',
    };
    
    const response = await apiRequest.post(Endpoints.SIGNUP, { data: invalidTypeData });
    
    expect([400, 422]).toContain(response.status());
  });

  test('User endpoints should handle malformed JSON', { tag: ['@tc-037'] }, async ({ apiRequest }) => {
    const response = await apiRequest.post(Endpoints.SIGNUP, {
      data: '{"email": "test@example.com", "password": "StrongPassword123!",}',
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status()).toBe(422);
  });
}); 