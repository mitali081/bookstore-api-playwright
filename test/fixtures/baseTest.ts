import { test as baseTest, expect } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { BookDataContext } from '../../src/context/bookDataContext';
import { UserDataContext } from '../../src/context/userDataContext';
import { AuthContext } from '../../src/context/authContext';
import { Configuration } from '../../src/config/configManager';
import { CleanupContext } from '../../src/context/cleanupContext';

type TestFixtures = {
  baseURL: string;
  bookContext: BookDataContext;
  userContext: UserDataContext;
  authContext: AuthContext;
  cleanupContext: CleanupContext;
  apiRequest: APIRequestContext;
};

export const test = baseTest.extend<TestFixtures>({
  baseURL: async ({}, use) => {
    const env = process.env.ENV || 'qa';
    const config = Configuration.getInstance();

    // Only load config if not already loaded
    if (!config.getConfigValue('baseUrl')) {
      config.loadConfig(env);
    }

    const baseURL = process.env.BASE_URL || config.getConfigValue('baseUrl') || 'http://127.0.0.1:8000';
    await use(baseURL);
  },

  bookContext: async ({}, use) => {
    const bookContext = new BookDataContext();
    await use(bookContext);
    // Clean up after test
    bookContext.clear();
  },

  userContext: async ({}, use) => {
    const userContext = new UserDataContext();
    await use(userContext);
    // Clean up after test
    userContext.clear();
  },

  authContext: async ({}, use) => {
    const authContext = new AuthContext();
    await use(authContext);
    // Clean up after test
    authContext.clear();
  },

  cleanupContext: async ({}, use) => {
    const cleanupContext = new CleanupContext();
    await use(cleanupContext);
    // Clean up after test
    cleanupContext.clear();
  },

  apiRequest: async ({ playwright, baseURL }, use) => {
    const request = await playwright.request.newContext({ baseURL });
    await use(request);
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
