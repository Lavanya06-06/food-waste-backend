const cron = require('node-cron');
const db   = require('./db');

function startCronJobs() {

  // Runs every minute → checks for expired food items
  cron.schedule('* * * * *', async () => {
    try {
      const [result] = await db.query(
        `UPDATE food_items 
         SET status = 'expired'
         WHERE status = 'available'
           AND expiry_time < NOW()`
      );

      if (result.affectedRows > 0) {
        console.log(`⏰ Cron: ${result.affectedRows} food item(s) marked as expired.`);
      }

    } catch (err) {
      console.error('❌ Cron job failed:', err.message);
    }
  });

  console.log('✅ Cron jobs started!');
}

module.exports = startCronJobs;