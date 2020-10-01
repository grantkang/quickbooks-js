const QBXMLResponseProcessor = require("./qbxml-response-processor");
const InventoryItem = require('../../../lib/models/inventory-item');
const ItemInventoryConverter = require('../converters/item-inventory-converter');

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, InventoryItem, ItemInventoryConverter);
  }
}
