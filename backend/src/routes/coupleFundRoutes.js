const express = require('express');
const router = express.Router();
const {
  getCoupleFund,
  updateCoupleFund,
  addPartner,
  removePartner,
  addTransaction,
  getTransactions,
  deleteFund
} = require('../controllers/coupleFundController');

// Fund routes
router.get('/', getCoupleFund);
router.put('/', updateCoupleFund);
router.delete('/:id', deleteFund);

// Partner routes
router.post('/partners', addPartner);
router.delete('/partners/:partnerId', removePartner);

// Transaction routes
router.post('/transactions', addTransaction);
router.get('/transactions', getTransactions);

module.exports = router; 