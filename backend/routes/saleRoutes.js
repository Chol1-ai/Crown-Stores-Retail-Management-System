const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSalesByDate,
  getSalesByAgent,
  deleteSale
} = require('../controllers/saleController');

router.post('/', createSale);
router.get('/', getSales);
router.get('/report', getSalesByDate);
router.get('/agent/:agentId', getSalesByAgent);
router.delete('/:id', deleteSale);

module.exports = router;