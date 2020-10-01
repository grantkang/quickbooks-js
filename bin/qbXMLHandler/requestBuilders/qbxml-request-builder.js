
var data2xml = require('data2xml');
const convert = data2xml({
  xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});

module.exports = class QBXMLRequestBuilder {
  constructor(queueItem, mongooseModel, converter) {
    this.queueItem = queueItem;
    this.mongooseModel = mongooseModel;
    this.converter = converter;
  }

  getRequestName(action) {
    const { resourceType } = this.queueItem;
    return `${resourceType}${action}Rq`;
  }

  getRequestChildName(action) {
    const { resourceType } = this.queueItem;
    return `${resourceType}${action}`;
  }

  getDefaultQueryParams() {
    throw new Error('method `getDefaultQueryParams` must be implemeneted');
  }

  async isAMod() {
    const { action, resourceId } = this.queueItem;
    const resource = await this.mongooseModel.findOne({_id: resourceId});
    return resource.qbdId && action === 'addOrModify';
  }

  async buildQueryBody() {
    const body = {};
    body.QBXMLMsgsRq = { _attr: { onError: 'stopOnError' } };
    const { queueItem } = this;
    const { resourceId } = queueItem;
    const requestName = this.getRequestName('Query');

    if (!queueItem.queryParams) {
      queueItem.queryParams = this.getDefaultQueryParams();
      await queueItem.save();
    }

    body.QBXMLMsgsRq[requestName] = queueItem.queryParams;

    await queueItem.save();

    return body;
  }

  async buildAddOrModifyBody() {
    const body = {};
    body.QBXMLMsgsRq = { _attr: { onError: 'stopOnError' } };

    const { queueItem } = this;
    const { resourceId } = queueItem;
    let requestName;
    let requestChildName;

    if (this.isAMod()) {
      requestName = this.getRequestName('Mod');
      requestChildName = this.getRequestChildName('Mod');
    } else {
      requestName = this.getRequestName('Add');
      requestChildName = this.getRequestChildName('Add');
    }

    const dbObject = await this.mongooseModel.findOne({ _id: resourceId });
    if (dbObject.qbdId != null) dbObject.qbdFullName = null;

    const quickbooksObject = this.converter.toQBD(dbObject);
    const { DataExt } = quickbooksObject;

    delete quickbooksObject.DataExt;

    body.QBXMLMsgsRq[requestName] = {
      _attr: {
        requestID: queueItem._id
      },
      [requestChildName]: quickbooksObject
    }

    if (DataExt != null && DataExt.length > 0) {
      const DataExtModRq = DataExt.map(dataExtItem => {
        return {
          _attr: {
            requestID: queueItem._id
          },
          DataExtMod: dataExtItem
        }
      });
      body.QBXMLMsgsRq.DataExtModRq = DataExtModRq;
    }

    queueItem.queryParams = body.QBXMLMsgsRq;

    await queueItem.save();

    return body;
  }

  async buildXML() {
    const { action } = this.queueItem;

    let body;

    if(action === 'query') {
      body = await this.buildQueryBody();
    } else if(action === 'addOrModify') {
      body = await this.buildAddOrModifyBody();
    }

    const xml = convert(
      'QBXML',
      body
    );

    return xml;
  }
}
