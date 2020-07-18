const MongoClient = require('mongodb').MongoClient;

var _db;
var _client;

module.exports = {
  getDb: async function () {
    if(_db) return _db;
    try {
      const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true});
      _client = client;
      _db = client.db();
    } catch (err) {
      console.log(err);
    }
    return _db;
  },
  getUnprocessedTasks: async function() {
    var unprocessedTasks = [];
    try {
      unprocessedTasks = await this.getDb().collection('qbsdk_queues').find({ processed: 0 }).toArray();
    } catch (err) {
      console.log(err);
    }
    return unprocessedTasks;
  },
  setTicketToTask: async function(id, ticket) {
    try {
      await this.getDb().collection('qbsdk_queues').updateOne({ _id: id }, { $set: { ticket: ticket } });
    } catch(err) {
      console.log (err);
    }
  },
  processTaskByTicket: async function(ticket, callback) {
    try {
      await this.getDb().collection('qbsdk_queues').updateOne({ ticket: ticket }, { $set: { processed: 1 } });
    } catch (err) {
      console.log(err);
    }
  },
  closeConnection: async function(callback) {
    if(!_client) {
      return;
    }
    try {
      await _client.close();
    } catch(err) {
      console.log(err);
    }
  }
}
