export class UserDataContext {
  private email: string = '';
  private password: string = '';
  private authToken: string = '';

  public setEmail(value: string): void {
    this.email = value;
  }

  public getEmail(): string {
    return this.email;
  }

  public setPassword(value: string): void {
    this.password = value;
  }

  public getPassword(): string {
    return this.password;
  }

  public setAuthToken(value: string): void {
    this.authToken = value;
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  public clear(): void {
    this.email = '';
    this.password = '';
    this.authToken = '';
  }

  // Helper method to get all user data as an object
  public getUserData(): {
    email: string;
    password: string;
    authToken: string;
  } {
    return {
      email: this.email,
      password: this.password,
      authToken: this.authToken,
    };
  }

  // Helper method to set all user data from an object
  public setUserData(data: {
    email?: string;
    password?: string;
    authToken?: string;
  }): void {
    if (data.email !== undefined) this.email = data.email;
    if (data.password !== undefined) this.password = data.password;
    if (data.authToken !== undefined) this.authToken = data.authToken;
  }
}
