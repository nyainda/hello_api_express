/* eslint-disable camelcase */

exports.up = (pgm) => {
    
    pgm.createExtension('uuid-ossp', { ifNotExists: true });
    
    
    pgm.createTable('users', {
      user_id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      first_name: { type: 'varchar(255)', notNull: true },
      last_name: { type: 'varchar(255)', notNull: true },
      email: { type: 'varchar(255)', notNull: true, unique: true },
      password: { type: 'varchar(255)', notNull: true },
      phone: { type: 'varchar(255)' },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
  };
  
  exports.down = (pgm) => {
    // Drop the 'users' table
    pgm.dropTable('users');
  
    // Drop the 'uuid-ossp' extension if it was created by this migration
    pgm.dropExtension('uuid-ossp', { ifExists: true });
  };
