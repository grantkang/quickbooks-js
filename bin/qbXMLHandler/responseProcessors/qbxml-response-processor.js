
module.exports = class QBXMLResponseProcessor {
  constructor(responseBody, queueItem, mongooseModel, converter) {
    this.responseBody = responseBody;
    this.queueItem = queueItem;
    this.mongooseModel = mongooseModel;
    this.converter = converter;
  }

  async isAMod() {
    const { action, resourceId } = this.queueItem;
    const resource = await this.mongooseModel.findOne({ _id: resourceId });
    return resource.qbdId && action === 'addOrModify';
  }

  getResponseName(action) {
    const { resourceType } = this.queueItem;
    return `${resourceType}${action}Rs`;
  }

  getResponseChildName() {
    const { resourceType } = this.queueItem;
    return `${resourceType}Ret`;
  }

  async processQueryResponse() {
    const responseName = this.getResponseName('Query');
    const responseChildName = this.getResponseChildName();

    const QueryRs = this.responseBody[responseName];

    const qbdItems = Array.isArray(QueryRs[responseChildName]) ? QueryRs[responseChildName] : [QueryRs[responseChildName]];

    const items = qbdItems.map(this.converter.fromQBD);

    await Promise.all(items.map(item => this.mongooseModel.updateOne({ qbdId: item.qbdId }, item, { upsert: true })));

    const amountRemaining = Number.parseInt(QueryRs._attr.iteratorRemainingCount);
    const { queueItem } = this;

    if (amountRemaining > 0) {
      queueItem.queryParams._attr.iterator = 'Continue';
      queueItem.queryParams._attr.iteratorID = QueryRs._attr.iteratorID;
      queueItem.markModified('queryParams');
    } else {
      queueItem.processed = true;
    }
    await queueItem.save();
  }

  async processAddOrModifyResponse() {
    let responseName = this.isAMod ? this.getResponseName('Mod') : this.getResponseName('Add');
    let responseChildName = this.getResponseChildName();
    const item = await this.mongooseModel.findById(this.queueItem.resourceId);
    const { statusCode } = this.responseBody[responseName]._attr;
    if (statusCode === '3200') {
      item.qbdEditSequence = this.responseBody[responseName][responseChildName].EditSequence;
      await item.save();
    } else {
      this.queueItem.processed = true;
      await this.queueItem.save();
    }
  }

  async process() {
    const { action } = this.queueItem;
    if (action === 'query') {
      await this.processQueryResponse();
    } else if (action === 'addOrModify') {
      await this.processAddOrModifyResponse();
    }
  }
}
