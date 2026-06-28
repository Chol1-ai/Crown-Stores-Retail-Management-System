require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Sale = require('./models/Sale');
const Procurement = require('./models/Procurement');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/csrms_db');
  console.log('Connected to MongoDB');

  const password = await bcrypt.hash('password123', 10);

  await User.deleteMany({});
  const users = await User.create([
    { username: 'director1', password, role: 'director', full_name: 'John Director', email: 'director@crownstores.com' },
    { username: 'manager1', password, role: 'manager', full_name: 'Jane Manager', email: 'manager@crownstores.com' },
    { username: 'sales1', password, role: 'sales_agent', full_name: 'Bob Sales', email: 'sales@crownstores.com' }
  ]);
  console.log('Created users');

  await Category.deleteMany({});
  const categories = await Category.create([
    { name: 'Electronics', description: 'Electronic devices', status: 'active' },
    { name: 'Groceries', description: 'Food and beverages', status: 'active' },
    { name: 'Clothing', description: 'Apparel and accessories', status: 'active' }
  ]);
  console.log('Created categories');

  await Product.deleteMany({});
  const products = await Product.create([
    { name: 'Smartphone', description: 'Android phone', cost_price: 50000, selling_price: 65000, quantity_available: 25, reorder_level: 5, barcode: 'ELEC001', category_id: categories[0]._id, status: 'active' },
    { name: 'Laptop', description: '15 inch laptop', cost_price: 120000, selling_price: 150000, quantity_available: 10, reorder_level: 3, barcode: 'ELEC002', category_id: categories[0]._id, status: 'active' },
    { name: 'Rice 5kg', description: 'Premium rice', cost_price: 5500, selling_price: 7000, quantity_available: 100, reorder_level: 20, barcode: 'GRO001', category_id: categories[1]._id, status: 'active' },
    { name: 'Cooking Oil 5L', description: 'Refined sunflower oil', cost_price: 8000, selling_price: 10000, quantity_available: 40, reorder_level: 10, barcode: 'GRO002', category_id: categories[1]._id, status: 'active' },
    { name: 'T-Shirt', description: 'Cotton t-shirt', cost_price: 2000, selling_price: 3500, quantity_available: 50, reorder_level: 10, barcode: 'CLO001', category_id: categories[2]._id, status: 'active' }
  ]);
  console.log('Created products');

  await Procurement.deleteMany({});
  await Procurement.create([
    { product_id: products[0]._id, supplier_name: 'TechDistributors Ltd', quantity_received: 30, cost_price: 50000, date_received: new Date('2024-01-15') },
    { product_id: products[1]._id, supplier_name: 'TechDistributors Ltd', quantity_received: 15, cost_price: 120000, date_received: new Date('2024-01-20') },
    { product_id: products[2]._id, supplier_name: 'FarmFresh Suppliers', quantity_received: 150, cost_price: 5500, date_received: new Date('2024-02-01') },
    { product_id: products[3]._id, supplier_name: 'FarmFresh Suppliers', quantity_received: 60, cost_price: 8000, date_received: new Date('2024-02-05') },
    { product_id: products[4]._id, supplier_name: 'FashionHub Imports', quantity_received: 80, cost_price: 2000, date_received: new Date('2024-02-10') }
  ]);
  console.log('Created procurements');

  await Sale.deleteMany({});
  await Sale.create([
    { product_id: products[0]._id, quantity: 5, unit_price: 65000, total_amount: 325000, amount_paid: 325000, sales_agent_id: users[2]._id, date: new Date() },
    { product_id: products[2]._id, quantity: 20, unit_price: 7000, total_amount: 140000, amount_paid: 140000, sales_agent_id: users[2]._id, date: new Date() },
    { product_id: products[3]._id, quantity: 10, unit_price: 10000, total_amount: 100000, amount_paid: 100000, sales_agent_id: users[2]._id, date: new Date() }
  ]);
  console.log('Created sales');

  await mongoose.disconnect();
  console.log('Done seeding all data');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
