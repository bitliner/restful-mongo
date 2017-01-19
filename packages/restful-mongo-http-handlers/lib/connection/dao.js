let Logger = require('logb').getLogger(module.filename);
let ConnectionPool = require('./connectionPool');
/**
 * Dao class that provides common CRUD ops to run against a database
 */
class Dao extends ConnectionPool {
    /**
     * [constructor description]
     * @param  {[type]} options [description]
     */
    constructor(options) {
        super(options);
    }

    /**
     * [query description]
     * @param  {[type]}   db             [description]
     * @param  {[type]}   collectionName [description]
     * @param  {[type]}   query          [description]
     * @param  {[type]}   fields         [description]
     * @param  {[type]}   options        [description]
     * @param  {Function} cb             [description]
     */
    query(db, collectionName, query, fields, options, cb) {
        let T = this;
        let dbName = db;
        this.getDb({
            DATABASE_NAME: dbName,
        }, function(err, db) {
            if (!err) {
                db.collection(collectionName, function(err, collection) {
                    // console.log('q stringified', JSON.stringify(query));
                    Logger.info('Query', {
                        db: dbName,
                        collection: collectionName,
                        query: JSON.stringify(query),
                        fields: fields,
                        options: options,
                    });
                    if (typeof options.hint !== 'undefined') {
                        collection.ensureIndex(options.hint, {
                            background: true,
                        }, function(err, res) {
                            if (err) {
                                return cb(err);
                            }
                            T._doQuery(collection, query, fields, options, cb);
                        });
                    } else {
                        T._doQuery(collection, query, fields, options, cb);
                    }
                });
            }
        });
    }

    /**
     * [_doQueryAsCursor description]
     * @param  {[type]}   coll    [description]
     * @param  {[type]}   query   [description]
     * @param  {[type]}   fields  [description]
     * @param  {[type]}   options [description]
     * @param  {Function} cb      [description]
     */
    _doQueryAsCursor(coll, query, fields, options, cb) {
        coll.find(query, fields, options, function(err, cursor) {
            done(err, cursor, cb);
        });
    }

    /**
     * [_doQuery description]
     * @param  {[type]}   coll    [description]
     * @param  {[type]}   query   [description]
     * @param  {[type]}   fields  [description]
     * @param  {[type]}   options [description]
     * @param  {Function} cb      [description]
     */
    _doQuery(coll, query, fields, options, cb) {
        coll.find(query, fields, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                // TODO: replace with Logger
                console.log('DOCs', coll.collectionName, query, docs);
                done(err, docs, cb);
            });
        });
    }

    /**
     * [queryAsCursor description]
     * @param  {[type]}   db             [description]
     * @param  {[type]}   collectionName [description]
     * @param  {[type]}   query          [description]
     * @param  {[type]}   fields         [description]
     * @param  {[type]}   options        [description]
     * @param  {Function} cb             [description]
     */
    queryAsCursor(db, collectionName, query, fields, options, cb) {
        let T = this;
        let dbName = db;
        this.getDb({
            DATABASE_NAME: dbName,
        }, function(err, db) {
            if (err) {
                return done(err);
            }
            db.collection(collectionName, function(err, collection) {
                Logger.info('Query as cursor:', {
                    db: dbName,
                    collection: collectionName,
                    query: query,
                    fields: fields,
                    options: options,
                });
                if (typeof options.hint !== 'undefined') {
                    collection.ensureIndex(options.hint, {
                        background: true,
                    }, function(err, res) {
                        if (err) {
                            return cb(err);
                        }
                        T._doQueryAsCursor(collection, query, fields, options, cb);
                    });
                } else {
                    T._doQueryAsCursor(collection, query, fields, options, cb);
                }
            });
        });
    }

    /**
     * [get description]
     * @param  {[type]}   dbName         [description]
     * @param  {[type]}   collectionName [description]
     * @param  {[type]}   query          [description]
     * @param  {[type]}   fields         [description]
     * @param  {[type]}   options        [description]
     * @param  {Function} cb             [description]
     */
    get(dbName, collectionName, query, fields, options, cb) {
        this.getDb({
            DATABASE_NAME: dbName,
        }, function(err, db) {
            if (!err) {
                db.collection(collectionName, function(err, collection) {
                    Logger.info('get()', {
                        collection: collectionName,
                        query: query,
                        fields: fields,
                        options: options,
                    });
                    collection.find(query, fields, options, function(err, cursor) {
                        cursor.toArray(function(err, docs) {
                            if (docs) {
                                docs = docs[0];
                            }
                            done(err, docs, cb);
                        });
                    });
                });
            }
        });
    }

    /**
     * [distinct description]
     * @param  {[type]}   dbName         [description]
     * @param  {[type]}   collectionName [description]
     * @param  {[type]}   query          [description]
     * @param  {[type]}   field          [description]
     * @param  {[type]}   options        [description]
     * @param  {Function} cb             [description]
     */
    distinct(dbName, collectionName, query, field, options, cb) {
            query = query || {};
            options = options || {};
            this.getDb({
                DATABASE_NAME: dbName,
            }, function(err, db) {
                if (!err) {
                    db.collection(collectionName, function(err, collection) {
                        collection.distinct(field, query, function(err, docs) {
                            done(err, docs, cb);
                        });
                    });
                }
            });
        }
        /**
         * [save description]
         * @param  {[type]}   dbName         [description]
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   body           [description]
         * @param  {Function} cb             [description]
         */
    save(dbName, collectionName, body, cb) {
            this.getDb({
                DATABASE_NAME: dbName,
            }, function(err, db) {
                if (!err) {
                    db.collection(collectionName, function(err, collection) {
                        body = Array.isArray(body) ? body[0] : body;
                        // We only suc.pport inserting one document at a time
                        collection.insert(body, function(err, docs) {
                            if (Array.isArray(docs)) {
                                docs = docs[0];
                            }
                            cb(err, docs);
                        });
                    });
                }
            });
        }
        /**
         * [update description]
         * @param  {[type]}   dbName         [description]
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   query          [description]
         * @param  {[type]}   newObj         [description]
         * @param  {[type]}   options        [description]
         * @param  {Function} cb             [description]
         */
    update(dbName, collectionName, query, newObj, options, cb) {
            this.getDb({
                DATABASE_NAME: dbName,
            }, function(err, db) {
                if (!err) {
                    db.collection(collectionName, function(err, collection) {
                        delete newObj._id;
                        collection.findAndModify(query, [], newObj, options, function(err, doc) {
                            done(err, doc, cb);
                        });
                    });
                }
            });
        }
        /**
         * [count description]
         * @param  {[type]}   dbName         [description]
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   query          [description]
         * @param  {[type]}   options        [description]
         * @param  {Function} cb             [description]
         */
    count(dbName, collectionName, query, options, cb) {
            this.getDb({
                DATABASE_NAME:dbName
            },function(err, db) {
                if (!err) {
                    db.collection(collectionName, function(err, collection) {
                        collection.find(query, options).count(function(err, count) {
                            // db.close();
                            done(err, count, cb);
                        });
                    });
                }
            });
        }
        /**
         * [remove description]
         * @param  {[type]}   dbName         [description]
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   query          [description]
         * @param  {[type]}   options        [description]
         * @param  {Function} cb             [description]
         */
    remove(dbName, collectionName, query, options, cb) {
        this.getDb({
            DATABASE_NAME: dbName,
        }, function(err, db) {
            if (!err) {
                db.collection(collectionName, function(err, collection) {
                    collection.remove(query, {
                        single: false,
                    }, function(err, numberOfRemoved) {
                        if (err) {
                            return done(err, null, cb);
                        }
                        console.log('DAO: number of removed is', numberOfRemoved);
                        return done(err, numberOfRemoved, cb);
                    });
                });
            }
        });
    }
}
/**
 * [done description]
 * @param  {[type]}   err [description]
 * @param  {[type]}   res [description]
 * @param  {Function} cb  [description]
 * @return {Function}     [description]
 */
function done(err, res, cb) {
    if (err) {
        return cb(err, null);
    }
    return cb(null, res);
}
module.exports = Dao;