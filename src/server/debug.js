const dotenv = require('dotenv');
dotenv.config();

console.log('=== Environment Variables ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

console.log('\n=== Testing MySQL Connection ===');
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'kakao_map_db'
    });
    
    console.log('✅ MySQL connection successful');
    await connection.end();
  } catch (error) {
    console.log('❌ MySQL connection failed:', error.message);
  }
}

testConnection();