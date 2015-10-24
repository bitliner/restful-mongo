/* jshint node:true */
'use strict';

var QueryManipulator = require('../utils/query-manipulator'),
	Logger = require('logb').getLogger(module.filename);

module.exports.collections = function(req, res) {
	var self = this;
	return self.Dao.collections(req.params.db, [], {}, function(err, doc) {
		if (!err && !doc) {
			res.send(404);
		} else if (err) {
			res.status(500).json(err);
		} else {
			res.status(200).json(doc);
		}
	});
};

module.exports.query = function(req, res) {
	var query,
		fields,
		options,
		self;

	var containsIsoDate,
		containsObjectId;

	query = {};
	fields = {};
	options = {};
	self = this;


	console.log('ola')


	// Providing an id overwrites giving a query in the URL
	if (req.params.id) {
		query = {
			'_id': new BSON.ObjectID(req.params.id)
		};
	}

	if (req.query.rawQuery) {
		containsIsoDate = req.query.rawQuery.indexOf('ISODate') >= 0;
		containsObjectId = req.query.rawQuery.indexOf('ObjectId') >= 0;

		try {
			req.query.rawQuery = JSON.parse(req.query.rawQuery);
		} catch (e) {
			return res.json(500, {
				error: 'Error parsing json'
			});
		}

		query = req.query.rawQuery;

		if (containsIsoDate) {
			Logger.info('Query contains ISODate...converting it...');
			query = QueryManipulator.convertIsoDateInDate(query);
		}
		if (containsObjectId) {
			Logger.info('Query contains fake ObjectId...converting it...');
			query = QueryManipulator.convertFakeObjectIdInObjectId(query);

		}
	}
	Logger.info('Resulting query', {
		query: JSON.stringify(query)
	});
	if (req.query.fields) {
		try {
			req.query.fields = JSON.parse(req.query.fields);
		} catch (e) {
			console.log('Error parsin json', 'fields', req.query.fields);
			return res.json(500, {
				error: 'Error parsing json'
			});
		}
		fields = req.query.fields;
	}

	if (req.query.rawOptions) {
		try {
			req.query.rawOptions = JSON.parse(req.query.rawOptions);
		} catch (e) {
			return res.json(500, {
				error: 'Error parsing json'
			});
		}
		options = req.query.rawOptions;
	}
	if (req.params.id) {
		return self.Dao.get(req.params.db, req.params.collection, query, fields, options, function(err, doc) {
			if (!err && !doc) {
				res.send(404);
			} else if (err) {
				res.status(500).json(err);
			} else {
				res.status(200).json(doc);
			}
		});
	}
	Logger.info('Running query...', req.params.db, req.params.collection, query, fields, options);
	self.Dao.query(req.params.db, req.params.collection, query, fields, options, function(err, docs) {
		if (err) {
			res.status(500).json(err);
		} else {
			res.status(200).json(docs);
		}
	});
};

module.exports.distinct = function(req, res) {
	var query = {},
		options = {},
		key;

	key = req.params.key;

	if (!key) {
		return res.json('500', {
			message: 'Please specify a key for distinct'
		});
	}

	if (req.query.rawQuery) {
		query = JSON.parse(req.query.rawQuery);
	}

	if (req.query.rawOptions) {
		options = JSON.parse(req.query.rawOptions);
	}



	self.Dao.distinct(req.params.db, req.params.collection, query, key, options, function(err, result) {
		if (err) {
			res.json(500, err);
		} else {
			res.json(200, result);
		}
	});
};
module.exports.count = function(req, res) {
	var query = {},
		fields = {},
		options = {};

	if (req.query.rawQuery) {
		query = JSON.parse(req.query.rawQuery);
	}
	if (req.query.fields) {
		req.query.fields.split(/,/g).forEach(function(fName) {
			fields[fName] = 1;
		});
	}
	if (req.query.rawOptions) {
		options = JSON.parse(req.query.rawOptions);
	}

	self.Dao.count(req.params.db, req.params.collection, query, options, function(err, count) {
		if (err) {
			res.json(500, err);
		} else {
			res.json(200, count.toString());
		}
	});
};