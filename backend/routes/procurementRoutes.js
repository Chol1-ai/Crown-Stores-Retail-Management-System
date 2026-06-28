const express = require('express');
const router = express.Router();
const {
  createProcurement,
  getProcurements,
  getProcurementsByDate,
  deleteProcurement
} = require('../controllers/procurementController');

router.post('/', createProcurement);
router.get('/', getProcurements);
router.get('/report', getProcurementsByDate);
router.delete('/:id', deleteProcurement);

module.exports = router;