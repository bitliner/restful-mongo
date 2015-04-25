var MongoClient = require('mongodb').MongoClient,
    EventEmitter = new(require('events').EventEmitter)(),
    Logger = require('logb').getLogger(module.filename);


var DATABASE = {},
    database2IsInstantiatingAConnection = {},
    done = false


var _connect, _getConnectionUrl, closeDatabase;


var getUrlFromOptions = function(options) {
        var options = options || {};
        // console.log('options',options);
        if (typeof options.url !== 'undefined') {
            return options.url
        }
        return _getConnectionUrl(options)
    }
    /***
     */
module.exports.getDb = function(options, cb) {
    // console.log('options',options);
    var url = getUrlFromOptions(options);

    if (typeof DATABASE[url] !== 'undefined') {
        return cb(null, DATABASE[url])
    }
    if (typeof database2IsInstantiatingAConnection[url] !== 'undefined' && database2IsInstantiatingAConnection[url]) {
        EventEmitter.once('connected', function(err, databaseUrl) {
            if (err) {
                console.log('ERROR DURING INSTANTIATING CONNECTION TO DATABASE', databaseUrl, err)
                return;
            }
            if (databaseUrl == url) {
                return cb(null, DATABASE[url])
            }
        })
        return;
    }
    database2IsInstantiatingAConnection[url] = true;
    EventEmitter.once('connected', function(err, databaseUrl) {
        if (err) {
            console.log('ERROR DURING INSTANTIATING CONNECTION TO DATABASE', databaseUrl, err)
            return;
        }
        if (databaseUrl == url) {
            return cb(null, DATABASE[url])
        }
    })
    _connect(options, function(err, db) {
        DATABASE[url] = db
        EventEmitter.emit('connected', err, url);
    })

}
module.exports._connect = _connect = function(options, cb) {
    var url = getUrlFromOptions(options)
    MongoClient.connect(url, function(err, db) {
        cb(err, db)
    });
}

module.exports._getConnectionUrl = _getConnectionUrl = function(options) {
    // console.trace(options);

    var url = (typeof options.USERNAME !== 'undefined') ? ['mongodb://', options.USERNAME + ':' + options.PASSWORD + '@'] : ['mongodb://']

    if (typeof options.HOST !== 'undefined') {
        url.push(options.HOST + ':')
    } else {
        url.push('localhost:')
    }
    if (typeof options.PORT !== 'undefined') {
        url.push(options.PORT)
    } else {
        url.push('27017')
    }


    url.push('/' + options.DATABASE_NAME)
    url = url.join('');

    Logger.info('DB connection URL is', url);

    return url;
}



module.exports.closeDatabase = closeDatabase = function closeDatabase(db, url) {
    db.close(function() {
        console.log('MONGODB->CONNECTION_POOL:', url, 'closed')
    });
}
module.exports.closeAllDatabases = function() {

    Object.keys(DATABASE).forEach(function(k) {
        var db = DATABASE[k];
        closeDatabase(db, k);
    })
}