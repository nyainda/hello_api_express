// jest.setup.js

const db = require('./db'); // Adjust the path to your database module (db.js)

// Global setup
beforeAll(async () => {
  try {
    // Connect to the database before running tests
    await db.connect(); // Replace with your database connection setup function
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit with error if connection fails
  }
});

// Global teardown
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
