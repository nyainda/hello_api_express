// teardown.js
const db = require('./db');

module.exports = async function globalTeardown() {
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
};
