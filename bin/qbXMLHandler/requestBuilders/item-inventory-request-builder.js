const QBXMLRequestBuilder = require('./qbxml-request-builder');
const InventoryItem = require('../../../lib/models/inventory-item');
const ItemInventoryConverter = require('../converters/item-inventory-converter');

module.exports = class ItemInventoryRequestBuilder extends QBXMLRequestBuilder {

  constructor(queueItem) {
    super(queueItem, InventoryItem, ItemInventoryConverter);
  }

  getDefaultQueryParams() {
    const requestID = this.queueItem._id;
    return  {
      _attr: {
        requestID,
        iterator: 'Start'
      },
      MaxReturned: 100,
      ActiveStatus: "All",
      IncludeRetElement: '',
      OwnerID: 0
    }
  }

}
