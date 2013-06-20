var mongo = require("mongodb"),
    util = require("./util.js"),
    BSON = mongo.BSONPure,
    T=this;

function Dao(options){
    if (options){
        this.host=options.host
        this.port=options.port
    }else{
        this.host='localhost'
        this.port='27017'
    }
}

Dao.prototype._getServer=function(){
    var T=this;
    return new mongo.Server(T.host, T.port, {
        'auto_reconnect': true
    })
    //return T.server;    
}
Dao.prototype._getDb=function(db){
    var options={
            safe:true
        },
        T=this;
    return new mongo.Db(db, T._getServer() , options );
}




Dao.prototype.query=function(db,collectionName,query,fields,options,cb){
    var T=this
    console.log(db,collectionName,query,fields,options);
    T._getDb( db ).open(function(err, db) {
        //db.authenticate(config.db.username, config.db.password, function() {
        db.collection(collectionName, function(err, collection) {
            console.log('query, fields, options', query, fields, options)
            collection.find(query, fields, options, function(err, cursor) {
                cursor.toArray(function(err, docs) {
                    db.close();
                    done(err,docs,cb)
                });
            });
        });
    });
}
Dao.prototype.get=function(dbName,collectionName,query,fields,options,cb){
    var T=this
    T._getDb( dbName ).open(function(err, db) {
        //db.authenticate(config.db.username, config.db.password, function() {
        db.collection(collectionName, function(err, collection) {
            console.log('query, fields, options', query, fields, options)
            collection.find(query, fields, options, function(err, cursor) {
                cursor.toArray(function(err, docs) {
                    if (docs){
                        docs=docs[0]
                    }
                    db.close();
                    done(err,docs,cb)
                });
            });
        });
    });
}

Dao.prototype.save=function(dbName,collectionName,body,cb){
    var T=this
    T._getDb( dbName ).open(function(err, db) {
        //db.authenticate(config.db.username, config.db.password, function() {
        db.collection(collectionName, function(err, collection) {
            // We only support inserting one document at a time
            collection.insert(Array.isArray(body) ? body[0] : body, function(err, docs) {
                db.close();
                cb(err,docs)
            });
        });
    });
}

Dao.prototype.update=function(dbName,collectionName,query,newObj,options,cb){
    var T=this
    T._getDb( dbName ).open(function(err, db) {
        //db.authenticate(config.db.username, config.db.password, function() {
        db.collection(collectionName, function(err, collection) {


            delete newObj._id
            collection.findAndModify(query,[], newObj, options, function(err, doc) {
                done(err,doc,cb)
                db.close();
            });




        });
    });
}

function done(err,res,cb){
    if (err) {
        cb(err,null)
    }else{
        cb(null,res)
    }
}



module.exports=Dao