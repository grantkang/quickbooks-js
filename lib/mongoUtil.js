const MongoClient = require('mongodb').MongoClient;


var _db;
var _client;

module.exports = {

  connectToServer: function (callback) {
    MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true }, function (err, client) {
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
    _db.collection('qbsdk_queues').find({processed: 0}).toArray().then(unprocessedTasks => {
      callback(unprocessedTasks)
    });
  },
  closeConnection: function(callback) {
    _client.close(function(err) {
      callback(err);
    })
  }
}
