const mongoose = require("mongoose");

const actions = Object.freeze({
  QUERY: 'query',
  ADD_OR_MODIFY: 'addOrModify'
})

const resourceTypes = Object.freeze({
  CUSTOMER: 'Customer',
  INVOICE: 'Invoice',
  ITEM_INVENTORY: 'ItemInventory'
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
      type: String
    },
    processed: {
      type: Boolean,
      default: false
    },
    qbEntity: {
      type: String
    },
    queryParams: {
      type: Object
    },
    ticket: {
      type: String
    },
    runOnce: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('qbsdk_queues', qbsdkQueueItemSchema)
