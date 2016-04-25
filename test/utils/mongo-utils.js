'use strict';

var MongoClient = require('mongodb').MongoClient;

function MongoUtils(opts) {
	this.DB_URL = opts.DB_URL;
}

MongoUtils.prototype.getDbConnection = function(cb) {	
	MongoClient.connect(this.DB_URL, function(err, db) {
		if (err) {
			cb(err);
		} else {
			cb(null, db);
		}
	});
};

MongoUtils.prototype.queryAll = function(collectionName, cb) {
	this.getDbConnection(function(err, db) {
		if (err) {
			cb(err);
		} else {
			var collection = db.collection(collectionName);
			collection.find({}).toArray(function(err, docs) {
				if (err) {
					cb(err);
				} else {
					db.close();
					cb(null, docs);
				}
			});
		}
	});
};	

MongoUtils.prototype.query = function(collectionName, query, cb) {
	this.getDbConnection(function(err, db) {
		if (err) {
			cb(err);
		} else {
			var collection = db.collection(collectionName);
			collection.find(query).toArray(function(err, docs) {
				if (err) {
					cb(err);
				} else {
					db.close();
					cb(null, docs);
				}
			});
		}
	});
};

module.exports = MongoUtils;