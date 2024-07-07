/* eslint-disable camelcase */

exports.up = (pgm) => {
    // Create the 'user_organisations' table with appropriate columns and constraints
    pgm.createTable('user_organisations', {
      user_id: { type: 'uuid', notNull: true, references: 'users(user_id)' },
      org_id: { type: 'uuid', notNull: true, references: 'organisations(org_id)' },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Add a composite primary key constraint
    pgm.addConstraint('user_organisations', 'user_organisations_pkey', {
      primaryKey: ['user_id', 'org_id']
    });
  };
  
  exports.down = (pgm) => {
    // Drop the 'user_organisations' table
    pgm.dropTable('user_organisations');
  };