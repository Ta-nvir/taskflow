require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'TaskFlow API is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TaskFlow API', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`);
});
