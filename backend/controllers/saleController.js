const Sale = require('../models/Sale');
const Product = require('../models/Product');

const createSale = async (req, res) => {
  try {
    const { product_id, quantity, amount_paid, sales_agent_id } = req.body;
    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity_available < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const total_amount = quantity * product.selling_price;
    const sale = await Sale.create({
      product_id,
      quantity,
      unit_price: product.selling_price,
      total_amount,
      amount_paid,
      sales_agent_id
    });

    product.quantity_available -= quantity;
    await product.save();
    
    res.status(201).json({ id: sale._id, message: 'Sale recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product_id', 'name')
      .populate('sales_agent_id', 'full_name')
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesByDate = async (req, res) => {
  try {
    const { start_date, end_date, date } = req.query;
    let query = {};
    
    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date + 'T23:59:59')
      };
    } else if (date) {
      query.date = {
        $gte: new Date(date),
        $lt: new Date(date + 'T23:59:59')
      };
    }
    
    const sales = await Sale.find(query)
      .populate('product_id', 'name')
      .populate('sales_agent_id', 'full_name')
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesByAgent = async (req, res) => {
  try {
    const sales = await Sale.find({ sales_agent_id: req.params.agentId })
      .populate('product_id', 'name')
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSale, getSales, getSalesByDate, getSalesByAgent, deleteSale };