const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'diwan2026admin';
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure upload directory exists for local fallback uploads
const uploadDir = path.join(__dirname, 'assets', 'products', 'uploaded');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup for handling file uploads in memory (for Cloudinary) and local disk fallback
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Cloudinary if credentials provided
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo'
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✓ Cloudinary initialized successfully');
} else {
  console.log('ℹ Cloudinary credentials not provided or in demo mode. Local upload & direct URL mode active.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets and frontend
app.use(express.static(path.join(__dirname)));

// ============================================================================
// DATABASE & STORAGE LAYER (HYBRID: MONGODB OR LOCAL JSON)
// ============================================================================
let isMongoConnected = false;
let ProductModel = null;

// Mongoose Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  category: { type: String, default: 'Unisex' },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  filterCategories: { type: [String], default: ['best-sellers'] },
  createdAt: { type: Date, default: Date.now }
});

async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://'))) {
    try {
      await mongoose.connect(dbUrl);
      isMongoConnected = true;
      ProductModel = mongoose.model('Product', productSchema);
      console.log('✓ Connected to MongoDB successfully via DATABASE_URL');
      
      // If MongoDB is empty, seed from JSON
      const count = await ProductModel.countDocuments();
      if (count === 0 && fs.existsSync(DATA_FILE)) {
        const localProducts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        await ProductModel.insertMany(localProducts);
        console.log(`✓ Seeded ${localProducts.length} initial products into MongoDB`);
      }
    } catch (err) {
      console.warn('⚠ Could not connect to MongoDB. Falling back to local JSON database storage:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('ℹ No MongoDB DATABASE_URL specified. Running with local persistent storage (data/products.json).');
  }
}

// Local JSON Storage Helpers
function getLocalProducts() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return [];
  }
}

function saveLocalProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving to JSON store:', err);
    return false;
  }
}

// Database Abstraction Methods
async function getAllProducts() {
  if (isMongoConnected && ProductModel) {
    const docs = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(doc => {
      const isFeatured = Boolean(doc.isFeatured);
      const filterCategories = Array.isArray(doc.filterCategories) ? doc.filterCategories : [doc.filterCategories].filter(Boolean);
      const placement = isFeatured ? 'featured' : (filterCategories[0] || 'best-sellers');
      return {
        id: doc.id,
        title: doc.title,
        price: doc.price,
        rating: doc.rating,
        category: doc.category,
        description: doc.description,
        imageUrl: doc.imageUrl,
        placement,
        isFeatured,
        filterCategories,
        createdAt: doc.createdAt
      };
    });
  }
  const local = getLocalProducts();
  return local.map(p => {
    const isFeatured = Boolean(p.isFeatured);
    const filterCategories = Array.isArray(p.filterCategories) ? p.filterCategories : [p.filterCategories].filter(Boolean);
    const placement = p.placement || (isFeatured ? 'featured' : (filterCategories[0] || 'best-sellers'));
    return {
      ...p,
      placement,
      isFeatured,
      filterCategories
    };
  });
}

async function getProductById(id) {
  if (isMongoConnected && ProductModel) {
    const doc = await ProductModel.findOne({ id }).lean();
    if (!doc) return null;
    const isFeatured = Boolean(doc.isFeatured);
    const filterCategories = Array.isArray(doc.filterCategories) ? doc.filterCategories : [doc.filterCategories].filter(Boolean);
    return {
      ...doc,
      placement: isFeatured ? 'featured' : (filterCategories[0] || 'best-sellers'),
      isFeatured,
      filterCategories
    };
  }
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

async function createProduct(productData) {
  let isFeatured = false;
  let filterCategories = [];
  let placement = productData.placement || (productData.isFeatured ? 'featured' : 'best-sellers');

  if (placement === 'featured' || productData.isFeatured === true) {
    isFeatured = true;
    filterCategories = [];
    placement = 'featured';
  } else {
    isFeatured = false;
    filterCategories = [placement];
  }

  const newProduct = {
    id: productData.id || `prod-${uuidv4().substring(0, 8)}`,
    title: productData.title.trim(),
    price: Number(productData.price) || 0,
    rating: Number(productData.rating) || 5.0,
    category: productData.category || 'Unisex',
    description: productData.description ? productData.description.trim() : '',
    imageUrl: productData.imageUrl || 'assets/products/amber_orient.jpg',
    placement,
    isFeatured,
    filterCategories,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && ProductModel) {
    await ProductModel.create(newProduct);
  } else {
    const products = getLocalProducts();
    products.unshift(newProduct);
    saveLocalProducts(products);
  }

  return newProduct;
}

async function updateProduct(id, updates) {
  let isFeatured = updates.isFeatured;
  let filterCategories = updates.filterCategories;
  let placement = updates.placement;

  if (placement !== undefined) {
    if (placement === 'featured') {
      isFeatured = true;
      filterCategories = [];
    } else {
      isFeatured = false;
      filterCategories = [placement];
    }
  } else if (isFeatured !== undefined) {
    if (isFeatured) {
      placement = 'featured';
      filterCategories = [];
    } else if (filterCategories && filterCategories.length > 0) {
      placement = filterCategories[0];
    } else {
      placement = 'best-sellers';
      filterCategories = ['best-sellers'];
    }
  }

  const cleanUpdates = {
    ...updates,
    ...(placement !== undefined ? { placement } : {}),
    ...(isFeatured !== undefined ? { isFeatured } : {}),
    ...(filterCategories !== undefined ? { filterCategories } : {})
  };

  if (isMongoConnected && ProductModel) {
    const updated = await ProductModel.findOneAndUpdate({ id }, { $set: cleanUpdates }, { new: true }).lean();
    return updated;
  }

  const products = getLocalProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...cleanUpdates,
    price: cleanUpdates.price !== undefined ? Number(cleanUpdates.price) : products[index].price,
    rating: cleanUpdates.rating !== undefined ? Number(cleanUpdates.rating) : products[index].rating,
    isFeatured: cleanUpdates.isFeatured !== undefined ? Boolean(cleanUpdates.isFeatured) : products[index].isFeatured,
    filterCategories: Array.isArray(cleanUpdates.filterCategories) ? cleanUpdates.filterCategories : products[index].filterCategories,
    placement: cleanUpdates.placement || (products[index].isFeatured ? 'featured' : (products[index].filterCategories?.[0] || 'best-sellers'))
  };

  saveLocalProducts(products);
  return products[index];
}

async function deleteProduct(id) {
  if (isMongoConnected && ProductModel) {
    const res = await ProductModel.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const products = getLocalProducts();
  const initialLength = products.length;
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === initialLength) return false;

  saveLocalProducts(filtered);
  return true;
}

// ============================================================================
// AUTHENTICATION GUARD MIDDLEWARE
// ============================================================================
// Generates a simple token based on the admin password hash / signature
function generateAuthToken(password) {
  return Buffer.from(`admin:${password}:${new Date().getFullYear()}`).toString('base64');
}

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedToken = generateAuthToken(ADMIN_PASSWORD);

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  // Accept valid token or direct password match in authorization header for flexibility
  if (token === expectedToken || token === ADMIN_PASSWORD) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Invalid credentials or session expired.' });
}

// ============================================================================
// AUTHENTICATION API ROUTES
// ============================================================================
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = generateAuthToken(ADMIN_PASSWORD);
    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: { name: 'Admin', role: 'admin' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid password. Access denied.' });
});

app.get('/api/auth/check', verifyAuth, (req, res) => {
  res.json({ success: true, message: 'Session is valid' });
});

// ============================================================================
// PRODUCT CRUD API ROUTES
// ============================================================================

// GET /api/products - Get all products with optional filters and search
app.get('/api/products', async (req, res) => {
  try {
    let products = await getAllProducts();
    const { category, filter, featured, q } = req.query;

    // Search query filter (title, description, category)
    if (q) {
      const search = q.toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search))
      );
    }

    // Category filter (Men, Women, Unisex)
    if (category && category !== 'all') {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter tab category (best-sellers, new-arrivals, top-rated)
    if (filter && filter !== 'all') {
      products = products.filter(p => 
        p.filterCategories && Array.isArray(p.filterCategories) && p.filterCategories.includes(filter)
      );
    }

    // Featured filter
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
});

// GET /api/products/:id - Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
});

// POST /api/products - Create new product (Protected)
app.post('/api/products', verifyAuth, async (req, res) => {
  try {
    const { title, price, category, rating, description, imageUrl, placement, isFeatured, filterCategories } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title and Price are required.' });
    }

    const created = await createProduct({
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
});

// PUT /api/products/:id - Update product (Protected)
app.put('/api/products/:id', verifyAuth, async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
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
});

// DELETE /api/products/:id - Delete product (Protected)
app.delete('/api/products/:id', verifyAuth, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
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
});

// ============================================================================
// IMAGE UPLOAD API (CLOUDINARY + LOCAL DISK FALLBACK)
// ============================================================================
app.post('/api/upload', verifyAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // 1. If Cloudinary is configured, upload directly to Cloudinary
    if (hasCloudinary) {
      return new Promise((resolve) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'diwan_al_attour/products',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: error.message });
            }
            return res.json({
              success: true,
              imageUrl: result.secure_url,
              publicId: result.public_id,
              message: 'Uploaded to Cloudinary successfully'
            });
          }
        );
        stream.end(req.file.buffer);
      });
    }

    // 2. Fallback: Save to local directory assets/products/uploaded/
    const filename = `uploaded-${Date.now()}-${uuidv4().substring(0, 6)}${path.extname(req.file.originalname) || '.jpg'}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);
    const relativeUrl = `assets/products/uploaded/${filename}`;

    res.json({
      success: true,
      imageUrl: relativeUrl,
      message: 'Image uploaded and stored locally in assets/products/uploaded/'
    });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ success: false, message: 'Failed to process image upload', error: err.message });
  }
});

// Friendly Page Routes
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Route for direct admin page access
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server & Connect Database
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`  DIWAN AL ATTOUR SERVER RUNNING`);
  console.log(`  Storefront : http://localhost:${PORT}`);
  console.log(`  Admin Panel: http://localhost:${PORT}/admin.html (or /admin)`);
  console.log(`====================================================`);
  await initDatabase();
});
