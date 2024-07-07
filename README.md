# hello_api_expressDB_CONNECTION=pgsql
DB_HOST=roundhouse.proxy.rlwy.net
DB_PORT=34926
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=nIxDKnIKudZnrTguUMqZLSKjguvUPdBX

organisation.js
exports.up = (pgm) => {
  pgm.createTable('organisations', {
    org_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('organisations');
};

user.js
exports.up = (pgm) => {
  // Ensure the 'uuid-ossp' extension exists, which provides the 'uuid_generate_v4()' function
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  
  // Create the 'users' table with appropriate columns and constraints
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

user_organisations.js
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
