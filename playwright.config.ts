import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import os from 'os';
import { Configuration } from './src/config/configManager';

dotenv.config();

const env = process.env.ENV || 'qa';
const configInstance = Configuration.getInstance();
configInstance.loadConfig(env);

const baseUrl = process.env.BASE_URL || configInstance.getConfigValue('baseUrl') || 'http://127.0.0.1:8000';
const timeout = Number(configInstance.getConfigValue('timeout')) || 30000;
const apiKey = process.env.API_KEY || configInstance.getConfigValue('apiKey') || '';

const environmentMetadata = {
  tester: process.env.TESTER || 'Mitali',
  environment: env.toUpperCase(),
  platform: os.platform(),
};

export default defineConfig({
  testDir: './test',
  timeout,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  use: {
    baseURL: baseUrl,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-output/html-report' }],
    ['allure-playwright', { outputFolder: 'test-output/allure-results' }],
  ],

  outputDir: 'test-output/artifacts',

  projects: [
    {
      name: 'API Tests - Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'API Tests - Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'API Tests - WebKit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
});
