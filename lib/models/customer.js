const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  qbdId: {
    type: String,
    unique: true
  },
  qbdFullName: {
    type: String,
    unique: true
  },
  qbdEditSequence: String,
  companyName: String,
  isActive: Boolean,
  phone: String,
  addressBlock: String,
  resaleNumber: String,
  balance: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('customers', customerSchema);
