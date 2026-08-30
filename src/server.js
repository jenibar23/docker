const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'appdb',
});

// Create a simple table on startup (for persistence testing)
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('DB init failed, will retry on next request:', err.message);
  }
}
initDb();

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Task 3 - Node.js + Express + PostgreSQL + Docker is running!' });
});

// Health check endpoint - used by Docker HEALTHCHECK and docker-compose
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected', error: err.message });
  }
});

// Add a visit record (to prove data persistence across container restarts)
app.post('/visits', async (req, res) => {
  try {
    const message = (req.body && req.body.message) || 'hello from task3';
    const result = await pool.query(
      'INSERT INTO visits (message) VALUES ($1) RETURNING *',
      [message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all visits (to check data survived a restart)
app.get('/visits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visits ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
