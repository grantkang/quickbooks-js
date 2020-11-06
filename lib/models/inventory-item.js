const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  qbdId: {
    type: String,
    unique: true
  },
  qbdFullName: {
    type: String,
    unique: true
  },
  qbdEditSequence: String,
  name: {
    type: String,
    unique: true
  },
  isActive: Boolean,
  description: String,
  price: Number,
  brand: String,
  imageUrl: String,
  category: String,
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('inventory_items', inventoryItemSchema);
