const QBXMLResponseProcessor = require("./qbxml-response-processor");
const InventoryItem = require('../../../lib/models/inventory-item');
const QueueItem = require('../../../lib/models/qbsdk-queue-item');

const itemMapper = qbItemInventory => {
  const { ListID, FullName, EditSequence, Name, IsActive, SalesDesc, SalesPrice, TimeCreated, TimeModified, DataExtRet } = qbItemInventory;
  const customFields = [];
  if(DataExtRet) {
    if(Array.isArray(DataExtRet)) customFields.push(...DataExtRet);
    else customFields.push(DataExtRet);
  }

  const item = {};
  item.qbdId = ListID;
  item.qbdFullName = FullName;
  item.qbdEditSequence = EditSequence;
  item.name = Name;
  item.isActive = IsActive;
  item.description = SalesDesc;
  item.price = SalesPrice;
  item.createdAt = new Date(TimeCreated);
  item.updatedAt = new Date(TimeModified);


  customFields.forEach(customField => {
    const { DataExtName, DataExtValue } = customField;
    if (DataExtName === 'CATEGORY') item.category = DataExtValue;
    if (DataExtName === 'IMAGEURL') item.imageUrl = DataExtValue;
    if (DataExtName === 'BRAND') item.brand = DataExtValue;
  });

  return item;
}

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, InventoryItem);
  }

  async processQueryResponse() {
    const { responseBody } = this;
    const inventoryItems = Array.isArray(responseBody.ItemInventoryRet) ? responseBody.ItemInventoryRet : [responseBody.ItemInventoryRet];

    responseBody.ItemInventoryRet.map(itemMapper);

    await Promise.all(inventoryItems.map(item => InventoryItem.updateOne({ qbdId: item.qbdId }, item, { upsert: true })));

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
  }
}
