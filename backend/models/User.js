const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  password:     { type: String, required: true },
  phone:        { type: String },
  isActive:     { type: Boolean, default: true },
  createdAt:    { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
