'use strict';

var Logger         = require('logb').getLogger(module.filename);
var ObjectID       = require('bson-objectid');
var utils          = require('./utils');
var ConnectionPool = require('@bitliner/connection-pool');

var getPutHttpHandler = function(opts) {

	return function(req, res) {
		var spec, options, newOptions, updateOne;

		updateOne = req.params.id ? true : false;

		if (req.params.id) {
			spec = {
				'_id': new ObjectID(req.params.id)
			};
		}

		if (!req.body) {
			return res.status(400).json({
				message: 'The request could not be understood by the server. Request body is missing'
			});
		}

		var $set, $addToSet, $pull, $push, rawQuery, update;

		Logger.info('PUT body:', req.body);
		update = req.body || {};

		update = utils.unescapeMongoDbModifiers(req.body);
		$set = update.$set;
		$addToSet = update.$addToSet;
		$push = update.$push;
		$pull = update.$pull;

		rawQuery = req.query.rawQuery;

		if (!$set && !$addToSet && !$push && !$pull) {
			delete update._id;
		}

		if (rawQuery && rawQuery !== '' && rawQuery !== 'null') {
			rawQuery = JSON.parse(req.query.rawQuery);
			rawQuery = utils.unescapeMongoDbModifiers(rawQuery);
			if (spec && spec._id) {
				rawQuery._id = spec._id;
			}
			spec = rawQuery;
		}

		options = {
			new: true,
			upsert: false,
			multi: true
		};

		if (!spec) {
			spec = {};
		}

		newOptions = req.query.rawOptions;
		if (req.query.rawOptions && rawQuery !== '' && rawQuery !== 'null') {
			newOptions = JSON.parse(req.query.rawOptions);
			// extend...how?
			newOptions = utils.mergeRecursive(options, newOptions);
		}

		console.log('query', spec);
		console.log('udpate', update);
		console.log('options', newOptions);

		ConnectionPool.getDb(opts, function(err, db) {
			if (!err) {
				db.collection(req.params.collection, function(err, collection) {
					if (updateOne) {
						return collection.findAndModify(spec, [], update, {
							new: true,
							upsert: false
						}, function(err, doc) {
							if (err) {
								Logger.error('Error, PUT', err);
								return res.json(500, err);
							}
							console.log('findAndModify result doc:', doc);
							res.status(200).json(doc);
						});
					} else {
						return collection.update(spec, update, {
							upsert: false,
							multi: true
						}, function(err, numberOfDocs) {
							if (err) {
								Logger.error('Error, PUT', err);
								return res.status(500).json(err);
							}
							res.status(200).json(numberOfDocs);
							// If you want to return the documents uncomment these lines
							/*collection.find(spec).toArray(function(err, docs) {
								if (err) {
									Logger.error('Error, PUT', err);
									return res.status(500).json(err);
								}
								res.status(200).json(docs);
							});*/
						});	
					}
				});
			}
		});
	};
};

var getDeleteHttpHandler = function(opts) {

	return function(req, res) {
		var spec, updateOne, rawQuery, justOne;

		updateOne = req.params.id ? true : false;

		if (req.params.id) {
			spec = {
				'_id': new ObjectID(req.params.id)
			};
		}

		justOne = req.qery.justOne;

		rawQuery = updateOne ? null : req.query.rawQuery;

		if (rawQuery && rawQuery !== '' && rawQuery !== 'null') {
			rawQuery = JSON.parse(req.query.rawQuery);
			rawQuery = utils.unescapeMongoDbModifiers(rawQuery);
			if (spec && spec._id) {
				rawQuery._id = spec._id;
			}
			spec = rawQuery;
		}

		console.log('query', spec);

		ConnectionPool.getDb(opts, function(err, db) {
			if (!err) {
				db.collection(req.params.collection, function(err, collection) {
					if (updateOne) {
						return collection.remove({}, function(err) {
							if (err) {
								Logger.error('Error, DELETE', err);
								return res.json(500, err);
							}
							res.status(200);
						});
					} else if (justOne) {
						return collection.remove(spec, true, function(err) {
							if (err) {
								Logger.error('Error, DELETE', err);
								return res.json(500, err);
							}
						});
					} else {
						return collection.remove(spec, function(err) {
							if (err) {
								Logger.error('Error, DELETE', err);
								return res.json(500, err);
							}
							res.status(200);
						});
					}
				});
			}
		});
	};
};

module.exports.getPutHttpHandler    = getPutHttpHandler;
module.exports.getDeleteHttpHandler = getDeleteHttpHandler;