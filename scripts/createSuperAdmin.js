require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createSuperAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    const email = 'vincentotienoakuku@gmail.com';
    const password = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [email, hashedPassword, 'Super Admin', 'superadmin', true];
    
    const result = await client.query(query, values);
    
    if (result.rows.length > 0) {
      console.log('✅ Super Admin created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await client.end();
  }
}

createSuperAdmin();