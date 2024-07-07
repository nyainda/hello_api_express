const db = require('../db');

class Organisation {
  static async create(name, description) {
    const result = await db.query(
      'INSERT INTO organisations (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM organisations WHERE org_id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT o.* FROM organisations o JOIN user_organisations uo ON o.org_id = uo.org_id WHERE uo.user_id = $1',
      [userId]
    );
    return result.rows;
  }

  static async addUser(orgId, userId) {
    await db.query(
      'INSERT INTO user_organisations (user_id, org_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, orgId]
    );
  }

  static async getUsers(orgId) {
    const result = await db.query(
      'SELECT u.* FROM users u JOIN user_organisations uo ON u.user_id = uo.user_id WHERE uo.org_id = $1',
      [orgId]
    );
    return result.rows;
  }
}

module.exports = Organisation;