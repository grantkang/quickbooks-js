const QBXMLRequestBuilder = require('./qbxml-request-builder');
const Customer = require('../../../lib/models/customer');

module.exports = class ItemInventoryRequestBuilder extends QBXMLRequestBuilder {

  constructor(queueItem) {
    super(queueItem, Customer);
  }

  getDefaultQueryParams() {
    const requestID = this.queueItem._id;
    return {
      _attr: {
        requestID,
        iterator: 'Start'
      },
      MaxReturned: 200,
      IncludeRetElement: '',
      OwnerID: 0
    }
  }
}
