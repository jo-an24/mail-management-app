const { pool } = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mails table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mails (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(255) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        body TEXT,
        folder VARCHAR(50) DEFAULT 'inbox',
        is_read BOOLEAN DEFAULT false,
        is_starred BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Labels table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mail labels junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mail_labels (
        mail_id INTEGER NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
        label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (mail_id, label_id)
      )
    `);

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mails_user_id ON mails(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_mails_folder ON mails(folder)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_labels_user_id ON labels(user_id)');

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

createTables().then(() => {
  pool.end();
  process.exit(0);
});
