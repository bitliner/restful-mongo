let BSON = require('mongodb').BSONPure;
let Logger = require('logb').getLogger(module.filename);
let utils = require('../utils');


/**
 * Http handlers for GET method
 */
class HandlerHttpGet {

	/**
	 * [constructor description]
	 * @param  {[type]} dao [description]
	 */
	constructor(dao) {
		this.dao = dao;
	}

	/**
	 * [service description]
	 * @return {[type]} [description]
	 */
	service() {
		return this;
	}

	/**
	 * [count description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 */
	count(req, res) {
		let query = {};
		let fields = {};
		let options = {};

		let containsIsoDate = false;
		let containsRegex = false;

		if (req.query.rawQuery) {
			query = JSON.parse(req.query.rawQuery);
			containsIsoDate = req.query.rawQuery.indexOf('ISODate') >= 0;
			containsRegex = req.query.rawQuery.indexOf('$regex') >= 0;
			query = utils.unescapeMongoDbModifiers(query);
			if (containsIsoDate) {
				query = utils.convertIsoDateInDate(query);
			}
			if (containsRegex) {
				query = utils.convertFakeRegexInRegexObject(query);
			}
		}
		if (req.query.fields) {
			req.query.fields.split(/,/g).forEach(function(fName) {
				fields[fName] = 1;
			});
		}
		if (req.query.rawOptions) {
			options = JSON.parse(req.query.rawOptions);
		}

		this.dao.count(
			req.params.db,
			req.params.collection,
			query,
			options,
			function(err, count) {
				if (err) {
					Logger.error('Error', err);
					res.json(500, err);
				} else {
					if (typeof count === 'number') {
						count = count.toString();
					}
					res.json(200, count);
				}
			});
	}

	/**
	 * [description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return {[type]} [description]
	 */
	distinct(req, res) {
		let query = {};
		let options = {};
		let key;
		let containsRegex = false;

		key = req.params.key;

		if (!key) {
			return res.json('500', {
				message: 'Please specify a key for distinct',
			});
		}

		if (req.query.rawQuery) {
			containsRegex = req.query.rawQuery.indexOf('$regex') >= 0;
			query = JSON.parse(req.query.rawQuery);
		}
		if (containsRegex) {
			query = utils.convertFakeRegexInRegexObject(query);
		}

		if (req.query.rawOptions) {
			options = JSON.parse(req.query.rawOptions);
		}

		this.dao.distinct(
			req.params.db,
			req.params.collection,
			query,
			key,
			options,
			function(err, result) {
				if (err) {
					Logger.error('Error', err);
					res.json(500, err);
				} else {
					res.json(200, result);
				}
			});
	}

	/**
	 * [_get description]
	 * @param  {[type]} req [description]
	 * @param  {[type]} res [description]
	 * @return   {[type]} res [description]
	 */
	get(req, res) {
		let query;
		let containsIsoDate;
		let containsObjectId;
		let containsRegex;
		let isThereRawQuery;

		query = req.query.query ? JSON.parse(req.query.query) : {};
		// console.log(query);
		// console.log('req.query', req.query);

		// Providing an id overwrites giving a query in the URL
		if (req.params.id) {
			query = {
				'_id': new BSON.ObjectID(req.params.id),
			};
		}
		let options = req.params.options || {};
		let fields = {};

		isThereRawQuery = req.query.rawQuery &&
			req.query.rawQuery !== '' &&
			req.query.rawQuery !== 'null';

		if (isThereRawQuery) {
			containsIsoDate = req.query.rawQuery.indexOf('ISODate') >= 0;
			containsObjectId = req.query.rawQuery.indexOf('ObjectId') >= 0;
			containsRegex = req.query.rawQuery.indexOf('$regex') >= 0;
			try {
				req.query.rawQuery = JSON.parse(req.query.rawQuery);
			} catch (e) {
				return res.json(500, {
					error: 'Error parsing json',
				});
			}
			query = req.query.rawQuery;
			if (containsIsoDate) {
				Logger.info('Query contains ISODate...converting it...');
				query = utils.convertIsoDateInDate(query);
				Logger.info('Resulting query', {
					query: JSON.stringify(query),
				});
			}
			if (containsObjectId) {
				Logger.info('Query contains fake ObjectId...converting it...');
				query = utils.convertFakeObjectIdInObjectId(query);
				Logger.info('Resulting query', {
					query: JSON.stringify(query),
				});
			}
			if (containsRegex) {
				Logger.info('Query contains fake regex...converting it...');
				query = utils.convertFakeRegexInRegexObject(query);
				console.log('remove me from http-handlers.get...');
				Logger.info('Resulting query', {
					query: JSON.stringify(query),
				});
			}
		}

		Logger.info('Parsing fields...');
		if (req.query.fields) {
			try {
				req.query.fields = JSON.parse(req.query.fields);
			} catch (e) {
				console.log('Error parsin json', 'fields', req.query.fields);
				return res.json(500, {
					error: 'Error parsing json',
				});
			}
			fields = req.query.fields;
		}
		Logger.info('Parsing sort options...');
		if (req.query.rawSort) {
			try {
				req.query.rawSort = JSON.parse(req.query.rawSort);
			} catch (e) {
				return res.json(500, {
					error: 'Error parsing json',
				});
			}
			options.sort = req.query.rawSort;
		}
		Logger.info('Parsing options...');
		if (req.query.rawOptions) {
			try {
				req.query.rawOptions = JSON.parse(req.query.rawOptions);
			} catch (e) {
				return res.json(500, {
					error: 'Error parsing json',
				});
			}
			options = req.query.rawOptions;
		}
		if (req.params.id) {
			Logger.info('Executing dao.get() ...');
			this.dao.get(
				req.params.db,
				req.params.collection,
				query,
				fields,
				options,
				function(err, doc) {
					if (!err && !doc) {
						res.send(404);
					} else if (err) {
						Logger.error('Error', err);
						res.json(500, err);
					} else {
						res.json(200, doc);
					}
				});
		} else {
			Logger.info('Executing dao.query() ...');
			this.dao.query(
				req.params.db,
				req.params.collection,
				query,
				fields,
				options,
				function(err, docs) {
					if (err) {
						Logger.error('Error', err);
						console.trace(err);
						res.json(500, err);
					} else {
						res.json(200, docs);
					}
				});
		}
	}
}

module.exports = HandlerHttpGet;