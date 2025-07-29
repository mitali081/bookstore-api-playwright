import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Configuration } from '../../../src/config/configManager';
import { Endpoints } from '../../../src/constants/endpoints';

type UserSignUpRequest = {
  email: string;
  password: string;
};

test.describe('User Account Tests', { tag: ['@module-user'] }, () => {
  let sharedUserEmail: string;
  let sharedUserPassword: string;
  let sharedAuthToken: string;
  let validPassword: string;

  test.beforeAll(async ({ userContext, apiRequest, authContext }) => {
    // Get password from config
    const config = Configuration.getInstance();
    config.loadConfig(process.env.ENV || 'qa');
    validPassword = config.getConfigValue('password') || 'StrongPassword123!';

    // Create a shared user for login tests
    TestDataFactory.populateUserContext(userContext);
    sharedUserEmail = userContext.getEmail();
    sharedUserPassword = userContext.getPassword();

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
      data: { email: sharedUserEmail, password: sharedUserPassword }
    });
    expect(signUpResponse.status()).toBe(200);

    // Login and store token
    await authContext.login(apiRequest, sharedUserEmail, sharedUserPassword);
    sharedAuthToken = authContext.getToken();
    expect(sharedAuthToken).toBeTruthy();
  });

  test('Create user with valid data', { tag: ['@smoke', '@tc-004'] }, async ({ userContext, apiRequest, cleanupContext }) => {
    TestDataFactory.populateUserContext(userContext);

    const userSignUp = {
      email: userContext.getEmail(),
      password: userContext.getPassword(),
    };

    const response = await apiRequest.post(Endpoints.SIGNUP, { data: userSignUp });
    expect(response.status()).toBe(200);

    const { message } = await response.json();
    expect(message).toBe('User created successfully');

    cleanupContext.addObject(userContext.getEmail(), 'user');
  });

  test('Login user and get token', { tag: ['@smoke', '@tc-005'] }, async ({ apiRequest, authContext }) => {
    // Use the shared user created in beforeAll
    const loginResponse = await apiRequest.post(Endpoints.LOGIN, {
      data: { email: sharedUserEmail, password: sharedUserPassword }
    });
    expect(loginResponse.status()).toBe(200);

    const { access_token, token_type } = await loginResponse.json();
    expect(access_token).toBeTruthy();
    expect(token_type.toLowerCase()).toBe('bearer');
  });



  test('Create user with already registered email should return 400', { tag: ['@tc-006'] }, async ({ userContext, apiRequest, cleanupContext }) => {
    TestDataFactory.populateUserContext(userContext);

    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    let response = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(response.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    response = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.detail).toBe('Email already registered');
  });

  test('Create user with missing email should return 400', { tag: ['@tc-007'] }, async ({ userContext, apiRequest }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    const invalidUser: UserSignUpRequest = {
      email: '',
      password: userContext.getPassword()
    };

    const response = await apiRequest.post(Endpoints.SIGNUP, { data: invalidUser });
    expect(response.status()).toBe(400);

    const errorResponse = await response.json();
    expect(errorResponse.detail).toBeDefined();
  });

  test('Create user with missing both email and password should return 400', async ({ userContext, apiRequest }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    const invalidUser: UserSignUpRequest = {
      email: '',
      password: ''
    };

    const response = await apiRequest.post(Endpoints.SIGNUP, { data: invalidUser });
    expect(response.status()).toBe(400);

    const errorResponse = await response.json();
    expect(errorResponse.detail).toBeDefined();
  });

  test('Create user with missing fields or empty body should return 422', async ({ apiRequest }) => {
    const response = await apiRequest.post(Endpoints.SIGNUP, { data: '' });
    expect(response.status()).toBe(422);

    const errorResponse = await response.json();
    expect(Array.isArray(errorResponse.detail)).toBe(true);
    expect(errorResponse.detail.length).toBe(1);
    expect(errorResponse.detail[0].type).toBe('missing');
    expect(errorResponse.detail[0].msg).toBe('Field required');
    expect(errorResponse.detail[0].loc).toEqual(['body']);
  });

  test('Create user with invalid email format should return 400', async ({ userContext, apiRequest }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    const invalidUser: UserSignUpRequest = {
      email: 'invalid-email-format',
      password: userContext.getPassword()
    };

    const response = await apiRequest.post(Endpoints.SIGNUP, { data: invalidUser });
    expect(response.status()).toBe(400);

    const errorResponse = await response.json();
    expect(errorResponse.detail).toBeDefined();
  });

  // Login validation tests
  test('Login with wrong password should return 400', async ({ userContext, apiRequest, cleanupContext }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    // Create user first
    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(signUpResponse.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    // Try login with wrong password
    const loginData = {
      email: userContext.getEmail(),
      password: validPassword + 'wrong',
    };

    const response = await apiRequest.post(Endpoints.LOGIN, { data: loginData });
    expect(response.status()).toBe(400);

    const details = await response.json();
    expect(details.detail).toBe('Incorrect email or password');
  });

  test('Login with invalid email should return 400', async ({ userContext, apiRequest, cleanupContext }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    // Create user first
    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(signUpResponse.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    // Try login with invalid email
    const loginData = {
      email: userContext.getEmail() + 'invalid',
      password: validPassword,
    };

    const response = await apiRequest.post(Endpoints.LOGIN, { data: loginData });
    expect(response.status()).toBe(400);

    const details = await response.json();
    expect(details.detail).toBe('Incorrect email or password');
  });

  test('Login with missing email or password should return 400', async ({ userContext, apiRequest, cleanupContext }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    // Create user first
    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(signUpResponse.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    const invalidData = [
      { email: '', password: validPassword, scenario: 'Missing email' },
      { email: userContext.getEmail(), password: '', scenario: 'Missing password' },
      { email: '', password: '', scenario: 'Missing both' },
    ];

    for (const { email, password } of invalidData) {
      const response = await apiRequest.post(Endpoints.LOGIN, { data: { email, password } });
      expect(response.status()).toBe(400);

      const errorResponse = await response.json();
      expect(errorResponse.detail).toBeDefined();
    }
  });

  test('Login with extra fields should ignore them and succeed', async ({ userContext, apiRequest, cleanupContext }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    // Create user first
    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(signUpResponse.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    // Try login with extra fields
    const loginPayload = {
      email: userContext.getEmail(),
      password: validPassword,
      extraField: 'shouldBeIgnored',
    };

    const response = await apiRequest.post(Endpoints.LOGIN, { data: loginPayload });
    expect(response.status()).toBe(200);

    const details = await response.json();
    expect(details).toHaveProperty('access_token');
  });

  test('Login with valid credentials should return 200 and token', async ({ userContext, apiRequest, cleanupContext }) => {
    // Create unique user for this test
    TestDataFactory.populateUserContext(userContext);

    // Create user first
    const signUpData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, { data: signUpData });
    expect(signUpResponse.status()).toBe(200);

    cleanupContext.addObject(userContext.getEmail(), 'user');

    // Login with valid credentials
    const loginData = {
      email: userContext.getEmail(),
      password: validPassword,
    };

    const response = await apiRequest.post(Endpoints.LOGIN, { data: loginData });
    expect(response.status()).toBe(200);

    const details = await response.json();
    expect(details).toHaveProperty('access_token');
    expect(typeof details.access_token).toBe('string');
  });

});