
module.exports = class QBXMLResponseProcessor {
  constructor(responseBody, queueItem, mongooseModel) {
    this.responseBody = responseBody;
    this.queueItem = queueItem;
    this.mongooseModel = mongooseModel;
  }

  async processQueryResponse() {
    throw new Error('method `processQuery` must be implemented');
  }

  async process() {
    const { queueItem } = this;
    const { action, queryParams } = queueItem;
    if (action === 'query') {
      await this.processQueryResponse();
    }
  }
}
