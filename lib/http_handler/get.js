var Dao = require('../dao');
var BSON = require('mongodb').BSONPure;

function HandlerHttpGet(dao) {
    this.dao = dao;
}

var _count = function(req, res) {
    var query = {},
    fields = {},
    options = {};

    if (req.query.rawQuery) {
        query = JSON.parse(req.query.rawQuery);
    }
    if (req.query.fields) {
        req.query.fields.split(/,/g).forEach(function(fName) {
            fields[fName] = 1
        })
    }
    if (req.query.rawOptions) {
        options = JSON.parse(req.query.rawOptions);
    }

    this.dao.count(req.params.db, req.params.collection, query, options, function(err, count) {
        if (err) {
            res.json(500, err)
        } else {
            res.json(200, count.toString())
        }
    })
};

var _distinct = function(req, res) {
    var query = {},
    options = {},
    key;

    key = req.params.key;

    if (!key) {
        return res.status('500').json({
            message: 'Please specify a key for distinct'
        });
    }

    if (req.query.rawQuery) {
        query = JSON.parse(req.query.rawQuery);
    }

    if (req.query.rawOptions) {
        options = JSON.parse(req.query.rawOptions);
    }

    this.dao.distinct(req.params.db, req.params.collection, query, key, options, function(err, result) {
        if (err) {
            res.json(500, err)
        } else {
            res.json(200, result)
        }
    })
};

var _get = function(req, res) {
    var query, containsIsoDate, containsObjectId;

    query = req.query.query ? JSON.parse(req.query.query) : {};
    console.log(query)
    console.log('req.query', req.query);

    // Providing an id overwrites giving a query in the URL
    if (req.params.id) {
        query = {
            '_id': new BSON.ObjectID(req.params.id)
        };
    }

    var options = req.params.options || {};
    var fields = {}
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout', '$exist'];

    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            if (o == 'sort') {
                var sort = {}
                req.query[o].split(/,/g).forEach(function(el) {
                    if (el.match(/^-/g)) {
                        var fieldName = el.substring(1, el.length)
                        sort[fieldName] = -1
                    } else {
                        sort[el] = 1
                    }
                })
                options['sort'] = sort
            } /************* code inserted  */
            else if (o == '$exist') {
                var fs = req.query[o].split(/,/g)
                fs.forEach(function(f) {
                    query[f] = {
                        $exists: 1
                    }
                })
            } /* ********* */
            else {
                options[o] = req.query[o];
            }
        } else {
            if (o == 'or') {
                var val = req.query[o].substring(1, req.query[o].length - 1),
                or = []
                val.split(/,/g).forEach(function(el) {
                    var dict = el.split(/=/g)
                    var obj = {}
                    if (dict[0] == '_id') {
                        dict[1] = new BSON.ObjectID(dict[1])
                    }
                    obj[dict[0].toString()] = dict[1]
                    or.push(obj)
                })
                query['$or'] = or
            } else if (o == '$regex') {
                var field = req.query[o].match(/[^,]*/)[0],
                regex = req.query[o].match(/,.*/)[0].substring(1);
                console.log('regex', regex);
                regex = new RegExp(regex, 'g')
                query[field] = {
                    '$regex': regex
                }
                console.log('field,$regex,query', field, regex, query)
            } else {
                // query[o] = req.query[o];
            }

        }
    }
    if (req.query.rawQuery) {
        containsIsoDate = req.query.rawQuery.indexOf('ISODate') >= 0;
        containsObjectId = req.query.rawQuery.indexOf('ObjectId') >= 0;
        try {
            req.query.rawQuery = JSON.parse(req.query.rawQuery);
        } catch (e) {
            return res.json(500, {
                error: 'Error parsing json'
            })
        }
        query = req.query.rawQuery;
        if (containsIsoDate) {
            Logger.info('Query contains ISODate...converting it...');
            query = convertIsoDateInDate(query);
            Logger.info('Resulting query', {
                query: JSON.stringify(query)
            });
        }
        if (containsObjectId) {
            Logger.info('Query contains fake ObjectId...converting it...');
            query = convertFakeObjectIdInObjectId(query);
            Logger.info('Resulting query', {
                query: JSON.stringify(query)
            });
        }
    }
    if (req.query.fields) {
        try {
            req.query.fields = JSON.parse(req.query.fields);
        } catch (e) {
            console.log('Error parsin json', 'fields', req.query.fields)
            return res.json(500, {
                error: 'Error parsing json'
            })
        }
        fields = req.query.fields;
    }
    if (req.query.rawSort) {
        try {
            req.query.rawSort = JSON.parse(req.query.rawSort);
        } catch (e) {
            return res.json(500, {
                error: 'Error parsing json'
            })
        }
        options.sort = req.query.rawSort;
    }
    if (req.query.rawOptions) {
        try {
            req.query.rawOptions = JSON.parse(req.query.rawOptions);
        } catch (e) {
            return res.json(500, {
                error: 'Error parsing json'
            })
        }
        options = req.query.rawOptions;
    }
    if (req.params.id) {
        this.dao.get(req.params.db, req.params.collection, query, fields, options, function(err, doc) {
            if (!err && !doc) {
                res.send(404)
            } else if (err) {
                res.json(500, err)
            } else {
                res.json(200, doc)
            }
        })
    } else {
        this.dao.query(req.params.db, req.params.collection, query, fields, options, function(err, docs) {
            if (err) {
                res.json(500, err)
            } else {
                res.json(200, docs)
            }
        })
    }
};

HandlerHttpGet.prototype.service = function () {
    return {
	count: _count.bind(this),
 	distinct: _distinct.bind(this),
	get: _get.bind(this)
    };
};

module.exports = HandlerHttpGet;
