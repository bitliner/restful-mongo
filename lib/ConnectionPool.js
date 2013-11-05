var MongoClient = require('mongodb').MongoClient;

    var DATABASE = {},
    done = false


    /***
    @options - it contains or url for connection or host, port, database name for connection 
*/

function ConnectionPool(options) {
    var self = this
    if(typeof options.url !== 'undefined') {
        self.url = options.url
    } else {
        self.url = self._getConnectionUrl(options)
    }
    console.log('RESTFUL MONGO','CONNECTED 2',self.url)

}
ConnectionPool.prototype.getDb = function(cb) {
    var self = this
    if(typeof DATABASE[self.url]!=='undefined') {
        cb(null, DATABASE[self.url])
    } else {
        self._connect(function(err, db) {
            if(err) {
                console.log('CONNECTION POOL:ERR', err)
                cb(err, null)
            }
            DATABASE[self.url] = db
            cb(null, DATABASE[self.url])
        })
    }
}
ConnectionPool.prototype._connect = function(cb) {
    var self = this,
        url = self.url
        console.log('DB-URL', url)
        MongoClient.connect(url, function(err, db) {
            cb(err, db)
        });
}
ConnectionPool.prototype._getConnectionUrl = function(options) {
    
    var url = (typeof options.USERNAME !== 'undefined'  ) ? ['mongodb://', options.USERNAME + ':' + options.PASSWORD + '@'] : ['mongodb://']

    if (typeof options.HOST!=='undefined'){
        url.push(options.HOST+':')   
    }else{
     url.push('localhost:')   
    }
    if (typeof options.PORT!=='undefined'){
        url.push(options.PORT+':')   
    }else{
     url.push('27017')   
    }


    url.push('/'+options.DATABASE_NAME)

    url = url.join('')
    console.log('DB CONN URL', url)
    return url
}

module.exports=ConnectionPool