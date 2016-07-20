var MongoClient = require('mongodb').MongoClient
, EventEmitter = new (require('events').EventEmitter)();
;

var DATABASE = {}
, database2IsInstantiatingAConnection={}
, done = false

function ConnectionPool(options) {
    this.options = options || {};
}

ConnectionPool.prototype.getUrlFromOptions = function(){
    console.log('options',this.options);
    if (typeof this.options.url !== 'undefined') {
        return this.options.url
    } 
    return this._getConnectionUrl()
}
/***
*/
ConnectionPool.prototype.getDb = function (cb) {
    console.log('options',this.options);
    var url=this.getUrlFromOptions();
    
    if (typeof DATABASE[url] !== 'undefined') {
        return cb(null, DATABASE[url])
    } 
    if (typeof database2IsInstantiatingAConnection[url]!=='undefined' && database2IsInstantiatingAConnection[url]){
        EventEmitter.once('connected', function(err,databaseUrl){
            if (err){
                console.log('ERROR DURING INSTANTIATING CONNECTION TO DATABASE', databaseUrl,err)
                return;
            }
            if (databaseUrl==url){
                return cb(null,DATABASE[url])
            }
        })
        return;
    }
    database2IsInstantiatingAConnection[url]=true;
    EventEmitter.once('connected', function(err,databaseUrl){
        if (err){
            console.log('ERROR DURING INSTANTIATING CONNECTION TO DATABASE', databaseUrl,err)
            return;
        }
        if (databaseUrl==url){
            return cb(null,DATABASE[url])
        }
    })
    this._connect(function (err, db) {
        console.log('IN CONNECT - TO CREATE A CONNECTION');
        DATABASE[url] = db
        EventEmitter.emit('connected', err,url);
    })
    
}

ConnectionPool.prototype._connect = function (cb) {
    var url=this.getUrlFromOptions()
    MongoClient.connect(url, function (err, db) {
        cb(err, db)
    });
}

ConnectionPool.prototype._getConnectionUrl = function () {

    var url = (typeof this.options.USERNAME !== 'undefined'  ) ? ['mongodb://', this.options.USERNAME + ':' + this.options.PASSWORD + '@'] : ['mongodb://']

    if (typeof this.options.HOST !== 'undefined') {
        url.push(this.options.HOST + ':')
    } else {
        url.push('localhost:')
    }
    if (typeof this.options.PORT !== 'undefined') {
        url.push(this.options.PORT + ':')
    } else {
        url.push('27017')
    }


    url.push('/' + this.options.DATABASE_NAME)

    url = url.join('')
    console.log('DB CONN URL', url)
    return url
}

ConnectionPool.prototype.closeDatabase = function closeDatabase(db,url){
    db.close(function(){
        console.log('MONGODB->CONNECTION_POOL:',url,'closed')
    });
}

ConnectionPool.prototype.closeAllDatabases = function () {
    Object.keys(DATABASE).forEach(function(k){
        var db=DATABASE[k];
        closeDatabase(db,k);
    })
}

module.exports = ConnectionPool;
