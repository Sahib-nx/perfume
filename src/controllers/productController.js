const db = require('../config/db');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    let products = await db.getAllProducts();
    const { category, filter, featured, q } = req.query;

    if (q) {
      const search = q.toLowerCase();
      products = products.filter(p =>
        (p.title && p.title.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'all') {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    if (filter && filter !== 'all') {
      products = products.filter(p =>
        p.filterCategories && Array.isArray(p.filterCategories) && p.filterCategories.includes(filter)
      );
    }

    if (featured !== undefined) {
      const isFeaturedBool = featured === 'true' || featured === '1';
      products = products.filter(p => Boolean(p.isFeatured) === isFeaturedBool);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve products', error: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { title, price, category, rating, description, imageUrl, placement, isFeatured, filterCategories } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title and Price are required.' });
    }

    const created = await db.createProduct({
      title,
      price,
      category,
      rating,
      description,
      imageUrl,
      placement,
      isFeatured,
      filterCategories
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: created
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
};
