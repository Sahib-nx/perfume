const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  category: { type: String, default: 'Unisex' },
  fragranceFamily: { type: String, default: '' },
  description: { type: String, default: '' },
  notes: { type: String, default: '' },
  mood: { type: String, default: '' },
  occasion: { type: String, default: '' },
  tags: { type: [String], default: [] },
  imageUrl: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  filterCategories: { type: [String], default: ['best-sellers'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
