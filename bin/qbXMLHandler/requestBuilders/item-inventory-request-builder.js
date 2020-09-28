const QBXMLRequestBuilder = require('./qbxml-request-builder');
const InventoryItem = require('../../../lib/models/inventory-item');

module.exports = class ItemInventoryRequestBuilder extends QBXMLRequestBuilder {

  constructor(queueItem) {
    super(queueItem, InventoryItem);
  }

  getDefaultQueryParams() {
    const requestID = this.queueItem._id;
    return  {
      _attr: {
        requestID,
        iterator: 'Start'
      },
      MaxReturned: 100,
      IncludeRetElement: '',
      OwnerID: 0
    }
  }
}
