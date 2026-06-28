const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplier_name: { type: String, required: true },
  quantity_received: { type: Number, required: true },
  cost_price: { type: Number, required: true },
  date_received: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Procurement', procurementSchema);