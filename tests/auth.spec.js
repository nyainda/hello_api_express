const request = require('supertest');
const app = require('../app');
const db = require('../db');
const jwt = require('jsonwebtoken');
const config = require('../config'); 

describe('Authentication and Authorization', () => {
  beforeAll(async () => {
    try {
      // Check if tables exist before deleting
      const tables = ['user_organisations', 'organisations', 'users'];
      for (const table of tables) {
        const { rows } = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = $1
          )`, [table]);
        if (rows[0].exists) {
          await db.query(`DELETE FROM ${table}`);
        }
      }
    } catch (error) {
      console.error('Error in test setup:', error);
    }
  });

  afterAll(async () => {
    try {
      await db.end();
      console.log('Database connection pool closed successfully.');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  });

  it('Should Register User Successfully with Default Organisation', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Registration successful');
    expect(res.body.data.user.firstName).toBe('John');
    expect(res.body.data.user.lastName).toBe('Doe');
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.accessToken).toBeTruthy();

    // Check if the default organisation was created
    const token = res.body.data.accessToken;
    const orgRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(orgRes.statusCode).toBe(200);
    expect(orgRes.body.data.organisations[0].name).toBe("John's Organisation");
  });

  it('Should Log the user in successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Login successful');
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('Should Fail Login with Invalid Credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });
  
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('Unauthorized');
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('Should Fail If Required Fields Are Missing', async () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'password'];

    for (const field of requiredFields) {
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
      };
      delete userData[field];

      const res = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(422);
      expect(res.body.errors).toContainEqual({
        field: field,
        message: expect.stringContaining('required'),
      });
    }
  });

  it('Should Fail if there\'s Duplicate Email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com', // Already registered email
        password: 'password123',
        phone: '0987654321',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('Bad request');
    expect(res.body.message).toBe('Email already exists. Please use a different email address.');
  });

  it('Should generate a token that expires at the correct time', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Token',
        lastName: 'Test',
        email: 'token@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    const token = res.body.data.accessToken;
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Assuming token expiration is set to 1 hour
    const expectedExpiration = Math.floor(Date.now() / 1000) + 3600;
    expect(Math.abs(decoded.exp - expectedExpiration)).toBeLessThan(5); // Allow 5 seconds difference
  });

  it('Should include correct user details in the token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'token@example.com',
        password: 'password123',
      });
  
    // Log the response body to check structure and where accessToken is located
   // console.log('Response Body:', res.body);
  
    // Ensure accessToken is correctly retrieved from the response
    const token = res.body.data.accessToken;
  
    // Log the token to ensure it's retrieved correctly
    //console.log('Token:', token);
  
    // Attempt to decode the token and handle any decoding errors
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
      //console.log('Decoded Token:', decoded);
    } catch (err) {
      console.error('Error decoding token:', err);
      throw err; // Rethrow the error to fail the test explicitly
    }
  
    // Assert that decoded.email matches the expected email
    expect(decoded.email).toBe('token@example.com');
  
    // Assert that userId or any other necessary fields are truthy
    expect(decoded.userId).toBeTruthy();
  });
  

  it('Should not allow users to see organizations they don\'t have access to', async () => {
    // Register first user and create their organization
    const res1 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'password123',
        phone: '1111111111',
      });

    const token1 = res1.body.data.accessToken;

    // Register second user and create their organization
    const res2 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
        password: 'password456',
        phone: '2222222222',
      });

    const token2 = res2.body.data.accessToken;

    // Get organizations for first user
    const orgRes1 = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token1}`);

    // Get organizations for second user
    const orgRes2 = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token2}`);

    // Each user should only see their own organization
    expect(orgRes1.body.data.organisations.length).toBe(1);
    expect(orgRes2.body.data.organisations.length).toBe(1);
    expect(orgRes1.body.data.organisations[0].name).toBe("Alice's Organisation");
    expect(orgRes2.body.data.organisations[0].name).toBe("Bob's Organisation");
  });

  // End-to-End test for registration
  it('Should perform end-to-end registration successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Eve',
        lastName: 'Johnson',
        email: 'eve@example.com',
        password: 'password789',
        phone: '3333333333',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Registration successful');
    expect(res.body.data.user.firstName).toBe('Eve');
    expect(res.body.data.user.lastName).toBe('Johnson');
    expect(res.body.data.user.email).toBe('eve@example.com');
    expect(res.body.data.accessToken).toBeTruthy();

    // Verify user can log in
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'eve@example.com',
        password: 'password789',
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.status).toBe('success');
    expect(loginRes.body.message).toBe('Login successful');

    // Verify organization was created
    const token = loginRes.body.data.accessToken;
    const orgRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(orgRes.statusCode).toBe(200);
    expect(orgRes.body.data.organisations.length).toBe(1);
    expect(orgRes.body.data.organisations[0].name).toBe("Eve's Organisation");
  });
});