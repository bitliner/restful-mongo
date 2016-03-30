'use strict';

var unescapeMongoDbModifiers = function(obj) {
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

var mergeRecursive = function(obj1, obj2) {

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

module.exports.unescapeMongoDbModifiers = unescapeMongoDbModifiers;
module.exports.mergeRecursive           = mergeRecursive;