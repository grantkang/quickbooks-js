const QBXMLResponseProcessor = require("./qbxml-response-processor");
const Customer = require('../../../lib/models/customer');

const customerMapper = qbdCustomer => {
  const { ListID, FullName, EditSequence, CompanyName, IsActive, Phone, ShipAddressBlock, ResaleNumber, Balance, TimeCreated, TimeModified } = qbdCustomer;

  const customer = {};
  customer.qbdId = ListID;
  customer.qbdFullName = FullName;
  customer.qbdEditSequence = EditSequence;
  customer.companyName = CompanyName || FullName;
  customer.isActive = IsActive;
  customer.phone = Phone;
  if (ShipAddressBlock) customer.addressBlock = Object.values(ShipAddressBlock).join('\n');
  customer.resaleNumber = ResaleNumber;
  customer.balance = Balance;
  customer.createdAt = new Date(TimeCreated);
  customer.updatedAt = new Date(TimeModified);

  return customer;
}

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, Customer);
  }

  async processQueryResponse() {
    try {
      const { responseBody } = this;
      const qbdCustomers = Array.isArray(responseBody.CustomerRet) ? responseBody.CustomerRet : [responseBody.CustomerRet];

      const customers = qbdCustomers.map(customerMapper);

      await Promise.all(customers.map(customer => Customer.findOneAndUpdate({ qbdId: customer.qbdId }, customer, { upsert: true })));

      const amountRemaining = Number.parseInt(responseBody._attr.iteratorRemainingCount);
      const { queueItem } = this;

      if (amountRemaining > 0) {
        queueItem.queryParams._attr.iterator = 'Continue';
        queueItem.queryParams._attr.iteratorID = responseBody._attr.iteratorID;
        queueItem.markModified('queryParams');
      } else {
        queueItem.processed = true;
      }
      await queueItem.save();
    } catch (error) {
      console.log(error);
    }

  }
}
