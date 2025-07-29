import { APIRequestContext } from '@playwright/test';
import { Endpoints } from '../constants/endpoints';

export class AuthContext {
  private token: string = '';

  public async login(apiContext: APIRequestContext, email: string, password: string): Promise<void> {
    const response = await apiContext.post(Endpoints.LOGIN, {
      data: { email, password },
    });
    const body = await response.json();
    this.token = body.access_token; // API returns 'access_token', not 'token'
  }

  public getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}` };
  }

  public getToken(): string {
    return this.token;
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public clear(): void {
    this.token = '';
  }
}
