const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: { type: String },
  cost_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  quantity_available: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 0 },
  barcode: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);