const QBXMLResponseProcessor = require("./qbxml-response-processor");
const InventoryItem = require('../../../lib/models/inventory-item');
const ItemInventoryConverter = require('../converters/item-inventory-converter');

module.exports = class ItemInventoryResponseProcessor extends QBXMLResponseProcessor {
  constructor(responseBody, queueItem) {
    super(responseBody, queueItem, InventoryItem, ItemInventoryConverter);
  }

  async processQueryResponse() {
    const { ItemInventoryQueryRs } = this.responseBody;

    const qbdInventoryItems = Array.isArray(ItemInventoryQueryRs.ItemInventoryRet) ? ItemInventoryQueryRs.ItemInventoryRet : [ItemInventoryQueryRs.ItemInventoryRet];

    const inventoryItems = qbdInventoryItems.map(ItemInventoryConverter.fromQBD);

    await Promise.all(inventoryItems.map(item => InventoryItem.updateOne({ qbdId: item.qbdId }, item, { upsert: true })));

    const amountRemaining = Number.parseInt(ItemInventoryQueryRs._attr.iteratorRemainingCount);
    const { queueItem } = this;

    if (amountRemaining > 0) {
      queueItem.queryParams._attr.iterator = 'Continue';
      queueItem.queryParams._attr.iteratorID = ItemInventoryQueryRs._attr.iteratorID;
      queueItem.markModified('queryParams');
    } else {
      queueItem.processed = true;
    }
    await queueItem.save();
  }

  async processAddOrModifyResponse() {
    let responseName = this.isAMod ? 'ItemInventoryModRs' : 'ItemInventoryAddRs';
    const item = await InventoryItem.findById(this.queueItem.resourceId);
    const { statusCode } = this.responseBody[responseName]._attr.statusCode;
    if(statusCode === '3200') {
      item.qbdEditSequence = this.responseBody[responseName].ItemInventoryRet.EditSequence;
      await item.save();
    } else {
      this.queueItem.processed = true;
      await this.queueItem.save();
    }
  }
}
