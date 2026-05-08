const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());


// Auth routes
app.use('/api/auth', require('./routes/auth'));


// Progress route
app.use('/api/progress', require('./routes/progress'));

// Generate Study Plan route
app.use('/api/generate', require('./routes/generate'));

// Data routes (notes, plans, quizzes, revisions)
app.use('/api', require('./routes/data'));


// Quiz submission and score routes
app.use('/api/quiz', require('./routes/quiz'));
// Quiz scores with topic and pagination
app.use('/api/quiz-scores', require('./routes/quizScore'));

// Correlation matrix route
app.use('/api/correlation-matrix', require('./routes/correlationMatrix'));

// Test route (optional)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = app;
