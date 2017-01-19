'use strict';

let MongoClient = require('mongodb').MongoClient;
let EventEmitter = new(require('events').EventEmitter)();
let Logger = require('logb').getLogger(module.filename);

let DATABASE = {};
let database2IsInstantiatingAConnection = {};
let mongodbUri = require('mongodb-uri');

/**
 * Function to manage connection pool
 */
class ConnectionPool {

    /**
     * [constructor description]
     * @param  {[type]} options [description]
     */
    constructor(options) {
        let uriObject;
        let url;

        Logger.debug('Creating ConnectionPool with options', options);

        this.options = options || {};
        url = options.url;

        if (url) {
            uriObject = mongodbUri.parse(url);

            this.scheme = uriObject.scheme;
            this.username = uriObject.username;
            this.password = uriObject.password;
            this.databaseName = uriObject.database;
            this.host = uriObject.host[0].host;
            this.port = uriObject.host[0].port;
        }
    }

    /**
     * [getUrlFromOptions description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    getUrlFromOptions(opts) {
        let optsKeys;
        let url;

        opts = opts || this.options;
        console.log('options', this.options);
        if (typeof opts.url !== 'undefined') {
            return opts.url;
        }
        optsKeys = Object.keys(opts);

        if (optsKeys.length === 1 && optsKeys.indexOf('DATABASE_NAME') === 0) {
            url = this._getConnectionUrl({
                USERNAME: this.username,
                PASSWORD: this.password,
                MONGODB_HOST: this.host,
                PORT: this.port,
                DATABASE_NAME: opts.DATABASE_NAME,
            });
            return url;
        }
        return this._getConnectionUrl(opts);
    }

    /**
     * [getDb description]
     * @param  {[type]}   opts [description]
     * @param  {Function} cb   [description]
     * @return {[type]}        [description]
     */
    getDb(opts, cb) {
        let isConnectionCreated;
        let url = this.getUrlFromOptions(opts);

        Logger.debug('Getting DB whose url is', url);

        if (typeof DATABASE[url] !== 'undefined') {
            return cb(null, DATABASE[url]);
        }
        isConnectionCreated = database2IsInstantiatingAConnection[url];
        if (isConnectionCreated) {
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
        this._connect(url, function(err, db) {
            console.log('IN CONNECT - TO CREATE A CONNECTION');
            DATABASE[url] = db;
            EventEmitter.emit('connected', err, url);
        });
    }

    /**
     * [_connect description]
     * @param  {[type]}   url [description]
     * @param  {Function} cb  [description]
     */
    _connect(url, cb) {
        MongoClient.connect(url, function(err, db) {
            cb(err, db);
        });
    }

    /**
     * [_getConnectionUrl description]
     * @param  {[type]} opts [description]
     * @return {[type]}      [description]
     */
    _getConnectionUrl(opts) {
        let options;
        options = Object.assign({}, this.options);
        Logger.debug('Dao options are', opts);
        options = Object.assign(options, opts);
        Logger.debug('Dao options are', options);
        let url = (typeof options.USERNAME !== 'undefined') ? ['mongodb://', options.USERNAME + ':' + options.PASSWORD + '@'] : ['mongodb://'];

        url.push((options.MONGODB_HOST || 'localhost') + ':');
        url.push(options.PORT || '27017');

        url.push('/' + options.DATABASE_NAME);

        url = url.join('');

        Logger.debug('_getConnectionUrl() -> URL is', url);
        return url;
    }

    /**
     * [closeDatabase description]
     * @param  {[type]} db [description]
     */
    closeDatabase(db) {
            db.close(function() {});
        }
        /**
         * [closeAllDatabases description]
         */
    closeAllDatabases() {
        Object.keys(DATABASE).forEach((k) => {
            let db = DATABASE[k];
            this.closeDatabase(db, k);
        });
    }
}

module.exports = ConnectionPool;