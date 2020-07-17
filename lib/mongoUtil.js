const MongoClient = require('mongodb').MongoClient;


var _db;
var _client;

module.exports = {

  connectToServer: function (callback) {
    MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true}, function (err, client) {
      if(err) console.log(err);
      _db = client.db();
      _client = client;
      return callback(err);
    });
  },
  getDb: function () {
    return _db;
  },
  getUnprocessedTasks: function(callback) {
    _db.collection('qbsdk_queues').find({processed: 0}).toArray()
    .then(function (unprocessedTasks) {
      callback(unprocessedTasks)
    });
  },
  setTicketToTask: function(id, ticket, callback) {
    _db.collection('qbsdk_queues').updateOne({_id: id}, {$set: {ticket: ticket}}, function(err) {
      callback(err);
    });
  },
  processTaskByTicket: function(ticket, callback) {
    _db.collection('qbsdk_queues').updateOne({ticket: ticket}, {$set: { processed: 1}}, function(err) {
      callback(err);
    });
  },
  closeConnection: function(callback) {
    _client.close(function(err) {
      callback(err);
    })
  }
}
