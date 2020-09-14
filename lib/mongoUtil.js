const MongoClient = require('mongodb').MongoClient;

var _db;
var _client;

module.exports = {
  getDb: async () => {
    if(_db) return _db;
    try {
      const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true});
      _client = client;
      _db = client.db();
    } catch (err) {
      throw err;
    }
    return _db;
  },
  getUnprocessedTasks: async () => {
    var unprocessedTasks = [];
    try {
      unprocessedTasks = await _db.collection('qbsdk_queues').find({ processed: 0 }).toArray();
    } catch (err) {
      throw err;    }
    return unprocessedTasks;
  },
  setTicketToTask: async (id, ticket) => {
    try {
      await _db.collection('qbsdk_queues').updateOne({ _id: id }, { $set: { ticket: ticket } });
    } catch(err) {
      throw err;
    }
  },
  processTaskByTicket: async (ticket, callback) => {
    try {
      await _db.collection('qbsdk_queues').updateOne({ ticket: ticket }, { $set: { processed: 1 } });
    } catch (err) {
      throw err;
    }
  },
  closeConnection: async (callback) => {
    if(!_client) {
      return;
    }
    try {
      await _client.close();
    } catch(err) {
      throw err;
    }
  }
}
