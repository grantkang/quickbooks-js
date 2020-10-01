const QBXMLResponseProcessor = require("./qbxml-response-processor");
const Customer = require('../../../lib/models/customer');
const CustomerConverter = require('../converters/customer-conveter');

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, Customer, CustomerConverter);
  }

  async processQueryResponse() {
    const { CustomerQueryRs } = this.responseBody;
    const qbdCustomers = Array.isArray(CustomerQueryRs.CustomerRet) ? CustomerQueryRs.CustomerRet : [CustomerQueryRs.CustomerRet];

    const customers = qbdCustomers.map(CustomerConverter.fromQBD);

    await Promise.all(customers.map(customer => Customer.findOneAndUpdate({ qbdId: customer.qbdId }, customer, { upsert: true })));

    const amountRemaining = Number.parseInt(CustomerQueryRs._attr.iteratorRemainingCount);
    const { queueItem } = this;

    if (amountRemaining > 0) {
      queueItem.queryParams._attr.iterator = 'Continue';
      queueItem.queryParams._attr.iteratorID = CustomerQueryRs._attr.iteratorID;
      queueItem.markModified('queryParams');
    } else {
      queueItem.processed = true;
    }
    await queueItem.save();
  }
}
