'use strict';

var Logger = require('logb').getLogger(module.filename);
var mongo = require('mongodb');
var BSON = mongo.BSONPure;


function toMongo(query) {
	var queryStr;

	queryStr = JSON.stringify(query);
	if (queryStr.indexOf('$regex') >= 0 ) {
		query = convertFakeRegexInRegexObject(query);
	}
	if (queryStr.indexOf('ObjectId') >= 0 ) {
		query = convertFakeObjectId(query);
	}
	if (queryStr.indexOf('ISODate') >= 0 ) {
		query = convertIsoDateInDate(query);
	}
	return query;
}

function hasFakeObjectId(jsonObj) {
	return JSON.stringify(jsonObj).indexOf('ObjectId') >= 0;
};

function convertFakeObjectId(query) {
	Logger.info('Running convertFakeObjectId');
	if (typeof value === 'object' && Array.isArray(query)) {
		return query.map(function(el) {
			return convertFakeObjectId(el);
		});
	}
	if (!query) {
		return null;
	}
	Object.keys(query).forEach(function(key) {
		var value;
		value = query[key];
		//Logger.info('-->', value);
		if (typeof value === 'object') {
			query[key] = convertFakeObjectId(query[key]);
		} else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
			// Logger.info('----->', 'found objectid', value)
			value = value.replace(/ObjectId\(./g, '');
			value = value.replace(/..$/g, '');
			// Logger.info('-----> 2', 'found objectid', value)
			query[key] = new BSON.ObjectID(value);
			Logger.info('Converted', query[key], query[key].constructor.name);
		}
	});
	//console.log('1111',typeof query._id)
	return query;
};

function convertFakeRegexInRegexObject(query) {
	Logger.info('Running convertFakeRegexInRegexObject');
	if (typeof value === 'object' && Array.isArray(query)) {
		return query.map(function(el) {
			return convertFakeRegexInRegexObject(el);
		});
	}
	if (!query) {
		return null;
	}
	Object.keys(query).forEach(function(key) {
		var value;

		var modifier, regex, tmp;

		value = query[key];

		Logger.info('-->', value);

		if (key === '$regex' && typeof value === 'string') {
			tmp = value.indexOf('/', 1);
			regex = value.substr(1, tmp - 1);
			modifier = value.substr(tmp + 1);
			regex = new RegExp(regex, modifier);
			query[key] = regex;
			Logger.info('Converted regex is', query[key].toString(), 'from', value);
		} else if (typeof value === 'object' && value) {
			query[key] = convertFakeRegexInRegexObject(query[key]);
		}
	});
	return query;
}

function unescapeMongoDbModifiers(obj) {
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
};

function convertFakeObjectIdInObjectId(query) {
	Logger.info('Runnin convertFakeObjectIdInObjectId');
	if (typeof value === 'object' && Array.isArray(query)) {
		return query.map(function(el) {
			return convertFakeObjectIdInObjectId(el);
		});
	}
	if (!query) {
		return null;
	}
	Object.keys(query).forEach(function(key) {
		var value;
		value = query[key];
		//Logger.info('-->', value);
		if (typeof value === 'object') {
			query[key] = convertFakeObjectIdInObjectId(query[key]);
		} else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
			// Logger.info('----->', 'found objectid', value)
			value = value.replace(/ObjectId\(./g, '');
			value = value.replace(/..$/g, '');
			// Logger.info('-----> 2', 'found objectid', value)
			query[key] = new BSON.ObjectID(value);
			//Logger.info('Converted', query[key], query[key].constructor.name);
		}
	});
	return query;
}

function mergeRecursive(obj1, obj2) {

	for (var p in obj2) {
		try {
			// Property in destination object set; update its value.
			if (obj2[p].constructor === Object) {
				obj1[p] = this.mergeRecursive(obj1[p], obj2[p]);

			} else {
				obj1[p] = obj2[p];

			}

		} catch (e) {
			// Property in destination object not set; create it and set its value.
			obj1[p] = obj2[p];

		}
	}

	return obj1;
};

function convertIsoDateInDate(query) {
	Logger.info('Runnin convertIsoDateInDate');
	if (typeof value === 'object' && Array.isArray(query)) {
		return query.map(function(el) {
			return convertIsoDateInDate(el);
		});
	}
	if (!query) {
		return null;
	}
	//Logger.info('--------------------------------->', query)
	Object.keys(query).forEach(function(key) {
		var value;
		value = query[key];
		if (typeof value === 'object') {
			query[key] = convertIsoDateInDate(query[key]);
		} else if (typeof value === 'string' && value.indexOf('ISODate') >= 0) {
			value = value.replace(/ISODate\(./g, '');
			value = value.replace(/..$/g, '');
			query[key] = new Date(value);
		}
	});
	return query;
}

module.exports.hasFakeObjectId = hasFakeObjectId;
module.exports.convertFakeObjectId = convertFakeObjectId;
module.exports.convertFakeRegexInRegexObject = convertFakeRegexInRegexObject;
module.exports.unescapeMongoDbModifiers = unescapeMongoDbModifiers;
module.exports.convertFakeObjectIdInObjectId = convertFakeObjectIdInObjectId;
module.exports.mergeRecursive = mergeRecursive;
module.exports.convertIsoDateInDate = convertIsoDateInDate;
module.exports.toMongo = toMongo;
