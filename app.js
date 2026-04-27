const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin      : '*',
  methods     : ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🌱 Food Waste Backend is running!',
    version: '1.0.0',
    status : 'OK'
  });
});



// ─── Routes ────────────────────────────────────────────────
app.use('/api/vendors',    require('./routes/vendors'));
app.use('/api/food-items', require('./routes/foodItems'));
app.use('/api/upload',     require('./routes/upload'));

// ─── 404 Handler ───────────────────────────────────────────  ← stays LAST
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    message: 'Something went wrong on the server.',
    error  : err.message
  });
});

module.exports = app;