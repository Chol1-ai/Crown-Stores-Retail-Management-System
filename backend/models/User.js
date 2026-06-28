const mongoose = require('mongoose');

// User model schema defining account fields
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['director', 'manager', 'sales_agent'], required: true },
  full_name: { type: String, required: true },
  email: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Export User model for use in routes and controllers
module.exports = mongoose.model('User', userSchema);