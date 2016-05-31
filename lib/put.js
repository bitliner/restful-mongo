'use strict';

var Logger = require('logb').getLogger(module.filename);
var ObjectID = require('bson-objectid');
var utils = require('./utils');
var ConnectionPool = require('@bitliner/connection-pool');

var Parser = {
	parseQuery: function(req) {
		var query;
		var id;

		query = req.query.rawQuery;
		id = (req.params.id) ? new ObjectID(req.params.id) : null;

		// query is in the URL
		if (query && query !== '' && query !== 'null') {
			query = JSON.parse(query);
		}

		// query is int he body
		if (!query) {
			query = req.body.query;
		}
		// if there is not query
		if (!query) {
			query = {};
		}

		query = utils.unescapeMongoDbModifiers(query);
		if (id) {
			query._id = id;
		}

		return query;

	},
	parseOptions: function(req) {
		var newOptions;

		var options = {
			new: true,
			upsert: false,
			multi: true
		};

		newOptions = req.body.options;

		if (newOptions) {
			options = utils.mergeRecursive(options, newOptions);
		}
		return options;

	},
	parseUpdate: function(req) {
		var update;
		var $set, $addToSet, $pull, $push;

		update = req.body.update || {};

		update = utils.unescapeMongoDbModifiers(update);
		$set = update.$set;
		$addToSet = update.$addToSet;
		$push = update.$push;
		$pull = update.$pull;

		if (!$set && !$addToSet && !$push && !$pull) {
			delete update._id;
		}

		return update;
	}
};



module.exports.getPutHttpHandler = function(opts) {

	return function(req, res) {
		var updateOne;

		updateOne = req.params.id ? true : false;



		if (!req.body) {
			return res.status(400).json({
				message: 'The request could not be understood by the server. Request body is missing'
			});
		}

		var query;
		var update;
		var options;



		query = Parser.parseQuery(req);
		update = Parser.parseUpdate(req);
		options = Parser.parseOptions(req);

		Logger.info('Running PUT', 'query', query, 'update', update, 'options', options);

		ConnectionPool.getDb(opts, function(err, db) {
			if (!err) {
				db.collection(req.params.collection, function(err, collection) {
					if (updateOne) {
						return collection.findAndModify(query, [], update, {}, {
							new: true,
							upsert: false
						}, function(err) {
							if (err) {
								Logger.error('Error, PUT', err);
								return res.json(500, err);
							}
							res.status(200).end();
						});
					} else {
						return collection.update(query, update, {
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