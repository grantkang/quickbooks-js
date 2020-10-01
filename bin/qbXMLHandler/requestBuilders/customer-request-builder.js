const QBXMLRequestBuilder = require('./qbxml-request-builder');
const Customer = require('../../../lib/models/customer');
const customerConveter = require('../converters/customer-conveter');

module.exports = class ItemInventoryRequestBuilder extends QBXMLRequestBuilder {

  constructor(queueItem) {
    super(queueItem, Customer, customerConveter);
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
