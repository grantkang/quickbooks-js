
var data2xml = require('data2xml');
const convert = data2xml({
  xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});

module.exports = class QBXMLRequestBuilder {
  constructor(queueItem, mongooseModel) {
    this.queueItem = queueItem;
    this.mongooseModel = mongooseModel;
  }

  getRequestName(action) {
    const { resourceType } = this.queueItem;
    return `${resourceType}${action}Rq`;
  }

  getDefaultQueryParams() {
    throw new Error('method `getDefaultQueryParams` must be implemeneted');
  }

  async isAModWithNoEditSequence() {
    const resource = await this.mongooseModel.findOne({_id: resourceId});
    const { action, resourceId, editSequence } = this.queueItem;

    const isAMod = !!resource.qbdId && action === 'addOrModify';

    const hasNoEditSequence = !editSequence;

    return isAMod && hasNoEditSequence;
  }


  async buildXML() {
    const body = {};
    body.QBXMLMsgsRq = { _attr: { onError: 'stopOnError' } };

    const { queueItem } = this;

    const { action, queryParams } = queueItem;


    if(action === 'query') {
      const requestName = this.getRequestName('Query');
      if(!queueItem.queryParams) {
        queueItem.queryParams = this.getDefaultQueryParams();
        await queueItem.save();
      }
      const { queryParams } = queueItem;

      body.QBXMLMsgsRq[requestName] = queryParams;
    } else if(action === 'addOrModify') {
      // Do stuff
    }

    return convert(
      'QBXML',
      body
    );
  }
}
