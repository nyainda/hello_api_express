const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('Authentication', () => {
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
      if (typeof db.end === 'function') {
        await db.end(); // Close the connection pool if using pg-pool
        console.log('Database connection pool closed successfully.');
      } else if (typeof db.close === 'function') {
        await db.close(); // Close the connection if using other database clients
        console.log('Database connection closed successfully.');
      } else {
        console.warn('No method found to close the database connection');
      }
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

  it('Should Fail If Required Fields Are Missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
      });
  
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toContainEqual({
      field: 'firstName',
      message: 'First name is required',
    });
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
  
  
});