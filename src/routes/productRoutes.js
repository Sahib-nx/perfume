const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAuth } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', verifyAuth, productController.createProduct);
router.put('/:id', verifyAuth, productController.updateProduct);
router.delete('/:id', verifyAuth, productController.deleteProduct);

module.exports = router;
