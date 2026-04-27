const db     = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);

    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ Connected! Result:', rows[0].result);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    process.exit();
  }
}

testConnection();