const QBXMLResponseProcessor = require("./qbxml-response-processor");
const Customer = require('../../../lib/models/customer');
const CustomerConverter = require('../converters/customer-conveter');

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, Customer, CustomerConverter);
  }
}
