import { APIResponse, expect, TestInfo } from '@playwright/test';

type DetailsResponse = {
  detail: string;
};

export async function assertForbidden(
  response: APIResponse,
  operation: string,
  testInfo?: TestInfo
) {
  expect(response.status()).toBe(403);

  const { detail } = (await response.json()) as DetailsResponse;
  expect(['Invalid token or expired token', 'Not authenticated']).toContain(detail);

  const message = `${operation} failed as expected with invalid token: ${detail}`;

  if (testInfo) {
    testInfo.annotations.push({
      type: 'info',
      description: message,
    });
  } else {
    console.info(message);
  }
}

export async function assertUnauthorized(
  response: APIResponse,
  operation: string,
  testInfo?: TestInfo
) {
  expect(response.status()).toBe(403);

  const { detail } = (await response.json()) as DetailsResponse;
  expect(detail).toBe('Not authenticated');

  const message = `${operation} failed as expected with no token: ${detail}`;

  if (testInfo) {
    testInfo.annotations.push({
      type: 'info',
      description: message,
    });
  } else {
    console.info(message);
  }
}

export async function assertNotFound(
  response: APIResponse,
  operation: string,
  testInfo?: TestInfo
) {
  expect(response.status()).toBe(404);

  const { detail } = (await response.json()) as DetailsResponse;
  expect(detail.toLowerCase()).toContain('not found');

  const message = `${operation} failed as expected with not found: ${detail}`;

  if (testInfo) {
    testInfo.annotations.push({
      type: 'info',
      description: message,
    });
  } else {
    console.info(message);
  }
} 