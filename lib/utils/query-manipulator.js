/* jshint node:true */
'use strict';

var Logger = require('logb').getLogger(module.filename),
	mongo = require('mongodb'),
	BSON = mongo.BSONPure;

module.exports = {
	convertIsoDateInDate: function(query) {
		var self = this;
		if (typeof value === 'object' && Array.isArray(query)) {
			return query.map(function(el) {
				return self.convertIsoDateInDate(el);
			});
		}
		Object.keys(query).forEach(function(key) {
			var value;

			value = query[key];

			if (typeof value === 'object') {
				query[key] = self.convertIsoDateInDate(query[key]);
			} else if (typeof value === 'string' && value.indexOf('ISODate') >= 0) {
				value = value.replace(/ISODate\(./g, '');
				value = value.replace(/..$/g, '');
				query[key] = new Date(value);
			}
		});
		return query;
	},
	convertFakeObjectIdInObjectId: function(query) {
		var self = this;

		if (typeof value === 'object' && Array.isArray(query)) {
			return query.map(function(el) {
				return self.convertFakeObjectIdInObjectId(el);
			});
		}
		Object.keys(query).forEach(function(key) {
			var value;

			value = query[key];

			Logger.info('-->', value);

			if (typeof value === 'object') {
				query[key] = self.convertFakeObjectIdInObjectId(query[key]);
			} else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
				value = value.replace(/ObjectId\(./g, '');
				value = value.replace(/..$/g, '');
				query[key] = new BSON.ObjectID(value);
				Logger.info('Converted', query[key], query[key].constructor.name);
			}
		});
		return query;
	},
	unescapeMongoDbModifiers: function(obj) {
		return JSON.parse(
			JSON.stringify(obj)
			.replace(/\+\$set/g, '$set')
			.replace(/\+\$addToSet/g, '$addToSet')
			.replace(/\+\$push/g, '$push')
			.replace(/\+\$pull/g, '$pull')
			.replace(/\+\$pullAll/g, '$pullAll')
			.replace(/\+\$each/g, '$each')
			.replace(/\+\$gt/g, '$gt')
			.replace(/\+\$gte/g, '$gte')
			.replace(/\+\$lt/g, '$lt')
			.replace(/\+\$lte/g, '$lte')
			.replace(/\+\$in/g, '$in')
			.replace(/\+\$ne/g, '$ne')
			.replace(/\+\$where/g, '$where')
			.replace(/\+\$elemMatch/g, '$elemMatch')
		);

	}
};