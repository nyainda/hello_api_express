const db = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create(firstName, lastName, email, password, phone) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [firstName, lastName, email, hashedPassword, phone]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  static async getOrganisations(userId) {
    const result = await db.query(
      'SELECT o.* FROM organisations o JOIN user_organisations uo ON o.org_id = uo.org_id WHERE uo.user_id = $1',
      [userId]
    );
    return result.rows;
  }
}

module.exports = User;