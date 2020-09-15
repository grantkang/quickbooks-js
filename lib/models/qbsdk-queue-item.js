const mongoose = require("mongoose");

const actions = Object.freeze({
  QUERY: 'query',
  ADD_OR_MODIFY: 'addOrModify'
})

const resourceTypes = Object.freeze({
  CUSTOMER: 'customer',
  INVOICE: 'invoice',
  ITEM: 'item',
  ITEMS: 'items'
})

const qbsdkQueueItemSchema = new mongoose.Schema(
  {
    accountId: {
      type: Number,
      default: 1
    },
    action: {
      type: String,
      enum: Object.values(actions)
    },
    resourceType: {
      type: String,
      enum: Object.values(resourceTypes)
    },
    resourceId: {
      type: Number
    },
    processed: {
      type: Boolean,
      default: false
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('qbsdk_queues', qbsdkQueueItemSchema)