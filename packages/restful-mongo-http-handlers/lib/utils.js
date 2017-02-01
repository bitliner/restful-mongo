'use strict';

let Logger = require('logb').getLogger(module.filename);
let ObjectID = require('mongodb').ObjectID;

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
		let value;
		value = query[key];
		if (typeof value === 'object') {
			query[key] = convertFakeObjectId(query[key]);
		} else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
			// Logger.info('----->', 'found objectid', value)
			value = value.replace(/ObjectId\(./g, '');
			value = value.replace(/..$/g, '');
			// Logger.info('-----> 2', 'found objectid', value)
			query[key] = new ObjectID(value);
			Logger.info('Converted', query[key], query[key].constructor.name);
		}
	});
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
		let value;

		let modifier;
		let regex;
		let tmp;

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
		.replace(/\+\$regex/g, '$regex')
		.replace(/\+\$or/g, '$or')
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
		let value;
		value = query[key];
		if (typeof value === 'object') {
			query[key] = convertFakeObjectIdInObjectId(query[key]);
		} else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
			value = value.replace(/ObjectId\(./g, '');
			value = value.replace(/..$/g, '');
			query[key] = new ObjectID(value);
		}
	});
	return query;
}

function mergeRecursive(obj1, obj2) {
	for (let p in obj2) {
		try {
			// Property in destination object set; update its value.
			if (obj2[p].constructor === Object) {
				obj1[p] = mergeRecursive(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch (e) {
			// Property in destination object not set;
			// create it and set its value.
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
	Object.keys(query).forEach(function(key) {
		let value;
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