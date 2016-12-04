var BSON = require('mongodb').BSONPure;
var Logger = require('logb').getLogger(module.filename);
var utils = require('../utils');

function HandlerHttpPost(dao) {
    this.dao = dao;
}

var _count = function (req, res) {
    var query = {},
    fields = {},
    options = {};

    var containsIsoDate = false;
    var containsRegex = false;
    var queryAsString;

    if (req.body.query) {
	query = req.body.query || {};
	queryAsString = JSON.stringify(query);
	containsIsoDate = queryAsString.indexOf('ISODate') >= 0;
	containsRegex = queryAsString.indexOf('$regex') >= 0;
	query = utils.unescapeMongoDbModifiers(query);
	if (containsIsoDate) {
	    query = utils.convertIsoDateInDate(query);
	}
	if (containsRegex) {
	    query = utils.convertFakeRegexInRegexObject(query);
	}
    }
    if (req.body.fields) {
	req.body.fields.split(/,/g).forEach(function(fName) {
	    fields[fName] = 1;
	});
    }
    if (req.body.rawOptions) {
	options = JSON.parse(req.body.rawOptions);
    }

    Logger.info('Running POST - count','Query is:', query);
    //console.log('QUERY',query);
    //console.log('OPTIONS', options);
    this.dao.count(req.params.db, req.params.collection, query, options, function(err, count) {
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
};

var _query = function(req, res) {
    var query,
    options,
    fields;

    var containsFakeObjectId = false;
    var containsRegex = false;
    var containsIsoDate = false;

    query = req.body.query || {};
    options = req.body.options || {};
    fields = req.body.fields || {};

    query = utils.unescapeMongoDbModifiers(query);
    containsFakeObjectId = JSON.stringify(query).indexOf('ObjectId') >= 0;
    containsIsoDate = JSON.stringify(query).indexOf('ISODate') >= 0;
    containsRegex = JSON.stringify(query).indexOf('$regex') >= 0;

    if (containsFakeObjectId) {
	Logger.info('Query contains fake objectIds');
	query = utils.convertFakeObjectIdInObjectId(query);
	Logger.info('Query after conversion into real ObjectId');
    }
    if (containsIsoDate) {
	Logger.info('Query contains fake IsoDate');
	query = utils.convertIsoDateInDate(query);
    }
    if (containsRegex) {
	Logger.info('Query contains fake regex');
	query = utils.convertFakeRegexInRegexObject(query);
    }

    this.dao.query(req.params.db, req.params.collection, query, fields, options, function(err, docs) {
	if (err) {
	    Logger.error('Error', err);
	    res.json(500, err);
	    return;
	}
	res.json(200, docs);
    });
};

var _distinct = function(req, res) {
    var query,
    options = {},
    key;
    var containsRegex = false;

    key = req.params.key;

    if (!key) {
	return res.json('500', {
	    message: 'Please specify a key for distinct'
	});
    }
    query = req.body.query || {};

    if (query) {
	query = utils.unescapeMongoDbModifiers(query);
	containsRegex = JSON.stringify(query).indexOf('$regex') >= 0;
    }
    if (containsRegex) {
	query = utils.convertFakeRegexInRegexObject(query);
    }

    options = req.body.options || {};
    options = utils.unescapeMongoDbModifiers(options);

    this.dao.distinct(req.params.db, req.params.collection, query, key, options, function(err, result) {
	if (err) {
	    Logger.error('Error', err);
	    res.json(500, err);
	} else {
	    res.json(200, result);
	}
    });
};

var _post = function(req, res) {
    this.dao.save(req.params.db, req.params.collection, req.body, function(err, doc) {
	if (err) {
	    Logger.error('Error', err);
	    return res.json(500, err);
	}
	res.json(200, doc);
    });
};

HandlerHttpPost.prototype.service = function () {
    return {
	count: _count.bind(this),
	distinct: _distinct.bind(this),
	query: _query.bind(this),
	post: _post.bind(this)
    };
};

module.exports = HandlerHttpPost;
