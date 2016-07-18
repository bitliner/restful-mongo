/*
rest.js
mongodb-rest

Created by Tom de Grunt on 2010-10-03.
Copyright (c) 2010 Tom de Grunt.
This file is part of mongodb-rest.
*/
var mongo = require("mongodb"),
    util = require("./util.js"),
    BSON = mongo.BSONPure,
    DaoModule = require('./Dao.js'),
    ConnectionPool = require('./ConnectionPool.js'),
    Logger = require('logb').getLogger(module.filename);

// TODO: instead of only one database, based on url, put the possibility to open more connection to different database
//       it requires that module ConnecitonPool instead of only 1 database sotres an object with url2database
//       so if the url is new, then it can create a nre connection, the only problem is that when dao make a query it is 
//       to be able to detect on which database the query is to 
//       be performed, 
//      
//  TODO: in configure, you have to pass app to different methods
//  TODO: transform setGet etc. in ._setGet
/***
    options - it contains the following: USERNAME (optional), PASSWORD (optional), HOST, PORT, DATABASE_NAME
*/
function RestfulMongo(options) {
    var self = this,
        options = options || {}
    this.options = options;
    self.Dao = new DaoModule(this.options)
}
RestfulMongo.prototype.getDao = function() {
    var self = this
    return self.Dao
}
RestfulMongo.prototype.configure = function(app, options) {


    /****************/
    var options = options || {},
        self = this

    if (options.methods) {
        var methods = options.methods
        methods = methods.map(function(m) {
            return m.toLowerCase()
        })

        methods.indexOf('get') >= 0 && self._setGet(app)
        methods.indexOf('post') >= 0 && self._setPost(app)
        methods.indexOf('put') >= 0 && self._setPut(app)
        methods.indexOf('del') >= 0 && self._setDel(app)


    } else {
        self._setGetForCount(app);
        self._setGetForDistinct(app);
        self._setGet(app)
        self._setPost(app)
        self._setPut(app)
        self._setDel(app)
    }
}


RestfulMongo.prototype._setGetForCount = _setGetForCount;
RestfulMongo.prototype._setGetForDistinct = _setGetForDistinct;
RestfulMongo.prototype._setGet = _setGet;
RestfulMongo.prototype._setDel = _setDel;
RestfulMongo.prototype._setPut = _setPut;
RestfulMongo.prototype._setPost = _setPost;

function _setGetForCount(app) {
    var self = this;

    app.get('/api/:db/:collection/count', function(req, res) {
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

        self.Dao.count(req.params.db, req.params.collection, query, options, function(err, count) {
            if (err) {
                res.json(500, err)
            } else {
                res.json(200, count.toString())
            }
        })
    })

}

function _setGetForDistinct(app) {
    var self = this;

    app.get('/api/:db/:collection/distinct/:key', function(req, res) {
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
                res.json(500, err)
            } else {
                res.json(200, result)
            }
        })
    })

}

function convertIsoDateInDate(query) {
    if (typeof value === 'object' && Array.isArray(query)) {
        return query.map(function(el) {
            return convertIsoDateInDate(el)
        })
    }
    Object.keys(query).forEach(function(key) {
        var value;

        value = query[key];

        if (typeof value === 'object') {
            query[key] = convertIsoDateInDate(query[key])
        } else if (typeof value === 'string' && value.indexOf('ISODate') >= 0) {
            value = value.replace(/ISODate\(./g, '');
            value = value.replace(/..$/g, '');
            query[key] = new Date(value);
        }
    });
    return query;
}

function convertFakeObjectIdInObjectId(query) {
    if (typeof value === 'object' && Array.isArray(query)) {
        return query.map(function(el) {
            return convertFakeObjectIdInObjectId(el)
        })
    }
    Object.keys(query).forEach(function(key) {
        var value;

        value = query[key];

        Logger.info('-->', value);

        if (typeof value === 'object') {
            query[key] = convertFakeObjectIdInObjectId(query[key])
        } else if (typeof value === 'string' && value.indexOf('ObjectId') >= 0) {
            Logger.info('----->', 'found objectid', value)
            value = value.replace(/ObjectId\(./g, '');
            value = value.replace(/..$/g, '');
            Logger.info('-----> 2', 'found objectid', value)
            query[key] = new BSON.ObjectID(value);
            Logger.info('Converted', query[key], query[key].constructor.name);
        }
    });
    return query;
}

function _setGet(app) {
    var self = this
        /**
         * Query
         */
    console.log('RESTful Mongo', 'Configuring GET')

    app.get('/api/:db/:collection/:id?', function(req, res) {
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
            self.Dao.get(req.params.db, req.params.collection, query, fields, options, function(err, doc) {
                if (!err && !doc) {
                    res.send(404)
                } else if (err) {
                    res.json(500, err)
                } else {
                    res.json(200, doc)
                }
            })
        } else {
            self.Dao.query(req.params.db, req.params.collection, query, fields, options, function(err, docs) {
                if (err) {
                    res.json(500, err)
                } else {
                    res.json(200, docs)
                }
            })
        }
    });
}

function _setPost(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring POST')
    /**
     * Insert
     */
    app.post('/api/:db/:collection', function(req, res) {
        self.Dao.save(req.params.db, req.params.collection, req.body, function(err, doc) {
            if (err) {
                return res.json(500, err)
            }
            res.json(200, doc)
        })
    });
}

function _setPut(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring PUT')

    /**
     * Update
     */
    app.put('/api/:db/:collection/:id', function(req, res) {
        var spec = {
            '_id': new BSON.ObjectID(req.params.id)
        };

        ConnectionPool.getDb(self.options, function(err, db) {
            if (!err) {
                db.collection(req.params.collection, function(err, collection) {
                    delete req.body._id
                    collection.findAndModify(spec, [], req.body, {
                        new: true,
                        upsert: false
                    }, function(err, doc) {
                        if (err) {
                            res.json(500, err)
                        } else {
                            res.json(200, doc)
                        }
                    });
                });
            }
        })
    });
}

function _setDel(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring DEL')

    /**
     * Delete
     */
    app.del('/api/:db/:collection/:id', function(req, res) {
        var spec = {
            '_id': new BSON.ObjectID(req.params.id)
        };

        ConnectionPool.getDb(self.options, function(err, db) {
            if (!err) {
                db.collection(req.params.collection, function(err, collection) {
                    collection.remove(spec, function(err, docs) {
                        res.header('Content-Type', 'application/json');
                        res.send('{"ok":1}');
                    });
                });
            }
        })

    });
}

module.exports = RestfulMongo