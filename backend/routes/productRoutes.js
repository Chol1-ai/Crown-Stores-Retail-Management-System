const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  searchProducts,
  updateProduct,
  deleteProduct,
  adjustStock
} = require('../controllers/productController');

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/search', searchProducts);
router.patch('/:id/adjust-stock', adjustStock);
router.delete('/:id', deleteProduct);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);

module.exports = router;