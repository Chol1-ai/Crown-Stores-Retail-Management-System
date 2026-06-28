const Procurement = require('../models/Procurement');
const Product = require('../models/Product');

const createProcurement = async (req, res) => {
  try {
    const { product_id, quantity_received, cost_price, supplier_name } = req.body;
    const procurement = await Procurement.create({ product_id, quantity_received, cost_price, supplier_name });
    
    const product = await Product.findById(product_id);
    product.quantity_available += quantity_received;
    await product.save();
    
    res.status(201).json({ id: procurement._id, message: 'Procurement recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProcurements = async (req, res) => {
  try {
    const procurements = await Procurement.find().populate('product_id', 'name').sort({ date_received: -1 });
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProcurementsByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const procurements = await Procurement.find({
      date_received: { $gte: new Date(start_date), $lte: new Date(end_date) }
    }).populate('product_id', 'name').sort({ date_received: -1 });
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProcurement = async (req, res) => {
  try {
    await Procurement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Procurement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProcurement, getProcurements, getProcurementsByDate, deleteProcurement };