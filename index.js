const app          = require('./app');
const db           = require('./config/db');
const startCronJobs = require('./config/cronJobs');
const dotenv       = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully!');

    // ← Start cron jobs after DB is ready
    startCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('💡 Check your .env credentials and try again.');
    process.exit(1);
  }
}

startServer();