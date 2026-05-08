// Sample correlation matrix data endpoint
const express = require('express');
const router = express.Router();

// Example correlation matrix data
const correlationMatrix = {
  features: ['Feature A', 'Feature B', 'Feature C'],
  matrix: [
    [1.00, 0.75, -0.20],
    [0.75, 1.00, 0.10],
    [-0.20, 0.10, 1.00],
  ],
};

// GET /api/correlation-matrix
router.get('/', (req, res) => {
  res.json(correlationMatrix);
});

module.exports = router;
