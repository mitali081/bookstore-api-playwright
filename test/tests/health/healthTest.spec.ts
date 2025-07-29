import { test, expect } from '../../fixtures/baseTest';
import { Endpoints } from '../../../src/constants/endpoints';

type HealthResponse = {
  status: string;
};

test.describe('Health API Tests', { tag: ['@module-health'] }, () => {
  test('Service health endpoint should return status "up"', { tag: ['@smoke', '@tc-001'] }, async ({ apiRequest }) => {
    const response = await apiRequest.get(Endpoints.HEALTH);
    expect(response.status()).toBe(200);

    const { status } = (await response.json()) as HealthResponse;
    expect(status).toBe('up');
  });

  test('Health endpoint should return correct content type', { tag: ['@smoke', '@tc-002'] }, async ({ apiRequest }) => {
    const response = await apiRequest.get(Endpoints.HEALTH);
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('Health endpoint should respond quickly', { tag: ['@smoke', '@tc-003'] }, async ({ apiRequest }) => {
    const startTime = Date.now();
    const response = await apiRequest.get(Endpoints.HEALTH);
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
