var mongo = require('mongodb');
var Logger = require('logb').getLogger(module.filename)
var ConnectionPool = require('./connectionPool');

var BSON = mongo.BSONPure;

function Dao(options) {
    ConnectionPool.call(this, options);
}

// Inherit from ConnectionPool
Dao.prototype = Object.create(ConnectionPool.prototype);
Dao.prototype.constructor = Dao;

Dao.prototype.query = function(db, collectionName, query, fields, options, cb) {
    var T = this,
        dbName = db;
    // console.log(db, collectionName, query, fields, options);

    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {
                // console.log('q stringified', JSON.stringify(query));
                Logger.info('Query', {
                    db: dbName,
                    collection: collectionName,
                    query: JSON.stringify(query),
                    fields: fields,
                    options: options
                });

                if (typeof options.hint !== 'undefined') {
                    collection.ensureIndex(options.hint, {
                        background: true
                    }, function(err, res) {
                        if (err) {
                            return cb(err)
                        }
                        T._doQuery(collection, query, fields, options, cb)
                    })
                } else {
                    T._doQuery(collection, query, fields, options, cb)
                }

            })
        }
    })
}

Dao.prototype._doQueryAsCursor = function(coll, query, fields, options, cb) {
    coll.find(query, fields, options, function(err, cursor) {
        done(err, cursor, cb)
    });
}

Dao.prototype._doQuery = function(coll, query, fields, options, cb) {
    coll.find(query, fields, options, function(err, cursor) {
        cursor.toArray(function(err, docs) {
            done(err, docs, cb)
        })
    });
}

Dao.prototype.queryAsCursor = function(db, collectionName, query, fields, options, cb) {
    var T = this,
        dbName = db;

    this.getDb(function(err, db) {
        if (err) {
            return done(err)
        }

        db.collection(collectionName, function(err, collection) {
            Logger.info('Query as cursor:', {
                db: dbName,
                collection: collectionName,
                query: query,
                fields: fields,
                options: options
            });

            if (typeof options.hint !== 'undefined') {
                collection.ensureIndex(options.hint, {
                    background: true
                }, function(err, res) {
                    if (err) {
                        return cb(err)
                    }
                    T._doQueryAsCursor(collection, query, fields, options, cb)
                })
            } else {
                T._doQueryAsCursor(collection, query, fields, options, cb)
            }

        })
    })
}

Dao.prototype.get = function(dbName, collectionName, query, fields, options, cb) {
    var T = this
    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {
                Logger.info('get()', {
                    collection: collectionName,
                    query: query,
                    fields: fields,
                    options: options
                });
                collection.find(query, fields, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        if (docs) {
                            docs = docs[0]
                        }
                        //         db.close();
                        done(err, docs, cb)
                    });
                });
            });
        }
    })
}

Dao.prototype.distinct = function(dbName, collectionName, query, field, options, cb) {
    var T = this;

    query = query || {};
    options = options || {};
    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {
                // console.log('query, fields, options', query, fields, options)
                collection.distinct(field, query, function(err, docs) {
                    done(err, docs, cb);
                });
            });
        }
    })
}

Dao.prototype.save = function(dbName, collectionName, body, cb) {
    var T = this
    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {
                // We only suc.pport inserting one document at a time
                collection.insert(Array.isArray(body) ? body[0] : body, function(err, docs) {
                    if (Array.isArray(docs)) {
                        docs = docs[0]
                    }
                    //  db.close();
                    cb(err, docs)
                });
            });
        }
    })
}

Dao.prototype.update = function(dbName, collectionName, query, newObj, options, cb) {
    var T = this

    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {

                delete newObj._id
                collection.findAndModify(query, [], newObj, options, function(err, doc) {
                    // db.close();
                    done(err, doc, cb)
                });


            });
        }
    })
}

Dao.prototype.count = function(dbName, collectionName, query, options, cb) {

    var T = this

    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {

                collection.find(query, options).count(function(err, count) {
                    // db.close();
                    done(err, count, cb)
                });


            });
        }

    })
}

Dao.prototype.remove = function(dbName, collectionName, query, options, cb) {
    var T = this

    this.getDb(function(err, db) {
        if (!err) {
            db.collection(collectionName, function(err, collection) {

                collection.remove(query, {
                    single: false
                }, function(err, numberOfRemoved) {
                    if (err) {
                        return done(err, null, cb)
                    }
                    console.log('DAO: number of removed is', numberOfRemoved);
                    return done(err, numberOfRemoved, cb)
                })

            });
        }

    })
}

function done(err, res, cb) {
    if (err) {
        cb(err, null)
    } else {
        cb(null, res)
    }
}


module.exports = Dao
