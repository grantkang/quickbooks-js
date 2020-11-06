const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  qbdId: {
    type: String,
    unique: true
  },
  invoiceNumber: {
    type: Number,
    unique: true
  },
  qbdEditSequence: String,
  customerRef: {
    qbdId: String,
    fullName: String
  },
  itemLines: [
    {
      qbdId: String,
      fullName: String,
      description: String,
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

invoiceSchema.methods.getTotal = function () {
  return this.itemLines.reduce((total, itemLine) => total + itemLine.total, 0);
};

module.exports = mongoose.model('invoices', invoiceSchema);
