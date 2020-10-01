
module.exports = class QBXMLResponseProcessor {
  constructor(responseBody, queueItem, mongooseModel) {
    this.responseBody = responseBody;
    this.queueItem = queueItem;
    this.mongooseModel = mongooseModel;
  }

  async isAMod() {
    const { action, resourceId } = this.queueItem;
    const resource = await this.mongooseModel.findOne({ _id: resourceId });
    return resource.qbdId && action === 'addOrModify';
  }

  async processQueryResponse() {
    throw new Error('method `processQueryResponse` must be implemented');
  }

  async processAddOrModifyResponse() {
    throw new Error('method `processAddOrModifyResponse` must be implemented');
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
