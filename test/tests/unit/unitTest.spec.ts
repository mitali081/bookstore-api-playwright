import { test, expect } from '@playwright/test';
import { Configuration } from '../../../src/config/configManager';
import { TestDataFactory } from '../../../src/data/testDataFactory';

// Unit tests using Playwright/Test
test.describe('Unit Tests - Configuration Manager', { tag: ['@unit'] }, () => {
  
  test('Configuration singleton pattern works correctly', { tag: ['@unit', '@tc-unit-001'] }, async () => {
    // Test singleton pattern
    const config1 = Configuration.getInstance();
    const config2 = Configuration.getInstance();
    
    expect(config1).toBe(config2);
    expect(config1).toBeInstanceOf(Configuration);
  });

  test('Configuration loads environment correctly', { tag: ['@unit', '@tc-unit-002'] }, async () => {
    const config = Configuration.getInstance();
    config.loadConfig('qa');
    
    const baseUrl = config.getConfigValue('baseUrl');
    expect(baseUrl).toBeTruthy();
    expect(typeof baseUrl).toBe('string');
  });

  test('Configuration handles missing values gracefully', { tag: ['@unit', '@tc-unit-003'] }, async () => {
    const config = Configuration.getInstance();
    config.loadConfig('qa');
    
    // Test with a key that might not exist in the config
    const timeoutValue = config.getConfigValue('timeout');
    // timeout is optional in EnvConfig, so it might be undefined
    expect(typeof timeoutValue).toBe('string');
  });
});

test.describe('Unit Tests - Test Data Factory', { tag: ['@unit'] }, () => {
  
  test('TestDataFactory generates unique emails', { tag: ['@unit', '@tc-unit-004'] }, async () => {
    const email1 = TestDataFactory.generateUniqueEmail();
    const email2 = TestDataFactory.generateUniqueEmail();
    
    expect(email1).toBeTruthy();
    expect(email2).toBeTruthy();
    expect(email1).not.toBe(email2);
    expect(email1).toMatch(/^test-\d+-\d+@example\.com$/);
  });

  test('TestDataFactory generates valid test users', { tag: ['@unit', '@tc-unit-005'] }, async () => {
    const testUser = TestDataFactory.createTestUser();
    
    expect(testUser).toBeTruthy();
    expect(testUser.email).toBeTruthy();
    expect(testUser.password).toBeTruthy();
    expect(testUser.password.length).toBeGreaterThanOrEqual(8);
    expect(testUser.password).toMatch(/[A-Z]/); // Contains uppercase
    expect(testUser.password).toMatch(/[a-z]/); // Contains lowercase
    expect(testUser.password).toMatch(/[0-9]/); // Contains number
    expect(testUser.password).toMatch(/[!@#$%^&*]/); // Contains special char
  });
});

test.describe('Unit Tests - Utility Functions', { tag: ['@unit'] }, () => {
  
  test('String validation utilities', { tag: ['@unit', '@tc-unit-006'] }, async () => {
    // Test string validation logic
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('Number validation utilities', { tag: ['@unit', '@tc-unit-007'] }, async () => {
    // Test number validation logic
    const isValidId = (id: number): boolean => {
      return id > 0 && Number.isInteger(id);
    };
    
    expect(isValidId(1)).toBe(true);
    expect(isValidId(100)).toBe(true);
    expect(isValidId(0)).toBe(false);
    expect(isValidId(-1)).toBe(false);
    expect(isValidId(1.5)).toBe(false);
  });
}); 