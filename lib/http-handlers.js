'use strict';

var Logger = require('logb').getLogger(module.filename);
var ObjectID = require('bson-objectid');
var utils = require('./utils');
var ConnectionPool = require('@bitliner/connection-pool');



// TODO: move to delete.js file
var getDeleteHttpHandler = function(opts) {

	return function(req, res) {
		var spec, updateOne, rawQuery, justOne;

		updateOne = req.params.id ? true : false;

		spec = {};

		if (req.params.id) {
			spec['_id'] = new ObjectID(req.params.id);
		}

		justOne = (req.qery && req.query.justOne) ? req.query.justOne : null;

		rawQuery = updateOne ? null : req.query.rawQuery;

		if (rawQuery && rawQuery !== '' && rawQuery !== 'null') {
			rawQuery = JSON.parse(req.query.rawQuery);
			rawQuery = utils.unescapeMongoDbModifiers(rawQuery);
			if (spec && spec._id) {
				rawQuery._id = spec._id;
			}
			spec = rawQuery;
		}


		ConnectionPool.getDb(opts, function(err, db) {
			if (!err) {
				db.collection(req.params.collection, function(err, collection) {
					if (justOne) {
						return collection.remove(spec, true, function(err) {
							if (err) {
								Logger.error('Error, DELETE', err);
								return res.json(500, err);
							}
							res.status(200).end();
						});
					} else {
						return collection.remove(spec, function(err) {
							if (err) {
								Logger.error('Error, DELETE', err);
								return res.json(500, err);
							}
							res.status(200).end();
						});
					}
				});
			} else {
				return res.status(500).json(err);
			}
		});
	};
};

module.exports.getPutHttpHandler = require('./put').getPutHttpHandler;
module.exports.getDeleteHttpHandler = getDeleteHttpHandler;