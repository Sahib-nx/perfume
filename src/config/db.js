const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ProductModel = require('../models/Product');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'products.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let isMongoConnected = false;

async function connectDB() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://'))) {
    if (dbUrl.includes('<db_username>') || dbUrl.includes('<username>') || dbUrl.includes('<password>')) {
      console.warn('⚠ Notice: DATABASE_URL in .env contains placeholder credentials. Running on local JSON store for now.');
      isMongoConnected = false;
      return;
    }

    try {
      await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      isMongoConnected = true;
      console.log('✓ Connected to MongoDB successfully via DATABASE_URL');

      // Auto-seed if MongoDB is empty
      const count = await ProductModel.countDocuments();
      if (count === 0 && fs.existsSync(DATA_FILE)) {
        const localProducts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (Array.isArray(localProducts) && localProducts.length > 0) {
          await ProductModel.insertMany(localProducts);
          console.log(`✓ Seeded ${localProducts.length} initial products into MongoDB`);
        }
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
  if (isMongoConnected) {
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
  if (isMongoConnected) {
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

  if (isMongoConnected) {
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

  if (isMongoConnected) {
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
  if (isMongoConnected) {
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

module.exports = {
  connectDB,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  isMongoConnected: () => isMongoConnected
};
