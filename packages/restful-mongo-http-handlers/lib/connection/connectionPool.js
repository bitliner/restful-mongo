'use strict';

var MongoClient = require('mongodb').MongoClient;
var EventEmitter = new(require('events').EventEmitter)();

var DATABASE = {};
var database2IsInstantiatingAConnection = {};

function ConnectionPool(options) {
    this.options = options || {};
}

ConnectionPool.prototype.getUrlFromOptions = function() {
    console.log('options', this.options);
    if (typeof this.options.url !== 'undefined') {
        return this.options.url;
    }
    return this._getConnectionUrl();
};
ConnectionPool.prototype.getDb = function(cb) {
    console.log('options', this.options);
    var url = this.getUrlFromOptions();

    if (typeof DATABASE[url] !== 'undefined') {
        return cb(null, DATABASE[url]);
    }
    if (typeof database2IsInstantiatingAConnection[url] !== 'undefined' && database2IsInstantiatingAConnection[url]) {
        EventEmitter.once('connected', function(err, databaseUrl) {
            if (err) {
                return;
            }
            if (databaseUrl === url) {
                return cb(null, DATABASE[url]);
            }
        });
        return;
    }
    database2IsInstantiatingAConnection[url] = true;
    EventEmitter.once('connected', function(err, databaseUrl) {
        if (err) {
            return;
        }
        if (databaseUrl === url) {
            return cb(null, DATABASE[url]);
        }
    });
    this._connect(function(err, db) {
        console.log('IN CONNECT - TO CREATE A CONNECTION');
        DATABASE[url] = db;
        EventEmitter.emit('connected', err, url);
    });

};

ConnectionPool.prototype._connect = function(cb) {
    var url = this.getUrlFromOptions();
    MongoClient.connect(url, function(err, db) {
        cb(err, db);
    });
};

ConnectionPool.prototype._getConnectionUrl = function() {

    var url = (typeof this.options.USERNAME !== 'undefined') ? ['mongodb://', this.options.USERNAME + ':' + this.options.PASSWORD + '@'] : ['mongodb://'];

    if (typeof this.options.MONGODB_HOST !== 'undefined') {
        url.push(this.options.MONGODB_HOST + ':');
    } else {
        url.push('localhost:');
    }
    if (typeof this.options.PORT !== 'undefined') {
        url.push(this.options.PORT + ':');
    } else {
        url.push('27017');
    }

    url.push('/' + this.options.DATABASE_NAME);

    url = url.join('');
    return url;
};

ConnectionPool.prototype.closeDatabase = function closeDatabase(db) {
    db.close(function() {});
};

ConnectionPool.prototype.closeAllDatabases = () => {
    Object.keys(DATABASE).forEach((k) => {
        var db = DATABASE[k];
        this.closeDatabase(db, k);
    });
};

module.exports = ConnectionPool;