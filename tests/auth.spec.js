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

   it('Should add a user to an organisation successfully', async () => {
    // Register two users
    const res1 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'adminpass123',
        phone: '1111111111',
      });

    const res2 = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Normal',
        lastName: 'User',
        email: 'normal@example.com',
        password: 'normalpass123',
        phone: '2222222222',
      });

    const adminToken = res1.body.data.accessToken;
    const normalUserId = res2.body.data.user.userId;

    // Get the admin's organisation
    const orgRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${adminToken}`);

    const orgId = orgRes.body.data.organisations[0].org_id;

    // Add the normal user to the admin's organisation
    const addUserRes = await request(app)
      .post(`/api/organisations/${orgId}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: normalUserId });

    expect(addUserRes.statusCode).toBe(200);
    expect(addUserRes.body.status).toBe('success');
    expect(addUserRes.body.message).toBe('User added to organisation successfully');

    // Verify that the normal user can now see the organisation
    const normalUserToken = res2.body.data.accessToken;
    const normalUserOrgRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${normalUserToken}`);

    expect(normalUserOrgRes.statusCode).toBe(200);
    expect(normalUserOrgRes.body.data.organisations.length).toBe(2); // Their own org and the added org
    expect(normalUserOrgRes.body.data.organisations.some(org => org.org_id === orgId)).toBe(true);
  });

  it('Should not add a user to an organisation they are already part of', async () => {
    // Use the admin user from the previous test
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpass123',
      });

    const adminToken = loginRes.body.data.accessToken;

    // Get the admin's organisation
    const orgRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${adminToken}`);

    const orgId = orgRes.body.data.organisations[0].org_id;
    const adminUserId = loginRes.body.data.user.userId;

    // Try to add the admin to their own organisation again
    const addUserRes = await request(app)
      .post(`/api/organisations/${orgId}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: adminUserId });

    expect(addUserRes.statusCode).toBe(400);
    expect(addUserRes.body.status).toBe('error');
    expect(addUserRes.body.message).toBe('User is already in the organisation');
  });

  it('Should fetch a single organisation by ID for the logged-in user', async () => {
    // Register a user
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234567890',
      });
  
    const token = registerRes.body.data.accessToken;
  
    // Get all organisations for the user
    const allOrgsRes = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);
  
    // Get the ID of the first organisation
    const orgId = allOrgsRes.body.data.organisations[0].org_id;
  
    // Fetch the single organisation by ID
    const singleOrgRes = await request(app)
      .get(`/api/organisations/${orgId}`)
      .set('Authorization', `Bearer ${token}`);
  
    // Assert the response structure and content
    expect(singleOrgRes.statusCode).toBe(200);
    expect(singleOrgRes.body).toEqual({
      status: 'success',
      message: expect.any(String),
      data: {
        org_id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }
    });
  
    // Assert that the returned organisation matches the requested one
    expect(singleOrgRes.body.data.org_id).toBe(orgId);
    expect(singleOrgRes.body.data.name).toBe("Test's Organisation");
  });
});