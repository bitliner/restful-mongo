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
    DaoModule=require('./Dao.js');

module.exports.Dao=DaoModule

module.exports.configure = function configure(app, config) {
    var Dao=new DaoModule({
        host: config.db.host,
        port: config.db.port
    })

    /**
     * Query
     */
    app.get('/api/:db/:collection/:id?', function(req, res) {
        var query = req.query.query ? JSON.parse(req.query.query) : {};
        console.log(query)

        // Providing an id overwrites giving a query in the URL
        if(req.params.id) {
            query = {
                '_id': new BSON.ObjectID(req.params.id)
            };
        }
        var options = req.params.options || {};
        var fields = {}
        var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];


        for(o in req.query) {
            if(test.indexOf(o) >= 0) {
                if(o == 'fields') {
                    req.query[o].split(/,/g).forEach(function(fName) {
                        fields[fName] = 1
                    })
                } else if(o == 'sort') {
                    var sort = {}
                    req.query[o].split(/,/g).forEach(function(el) {
                        if(el.match(/^-/g)) {
                            var fieldName = el.substring(1, el.length)
                            sort[fieldName] = -1
                        } else {
                            sort[el] = 1
                        }
                    })
                    options['sort'] = sort
                } else {

                    options[o] = req.query[o];
                }
            } else {
                if(o == 'or') {
                    var val = req.query[o].substring(1, req.query[o].length - 1),
                        or = []
                        val.split(/,/g).forEach(function(el) {
                            var dict = el.split(/=/g)
                            var obj={}
                            if (dict[0]=='_id'){
                                dict[1]=new BSON.ObjectID( dict[1] )
                            }
                            obj[dict[0].toString()]=dict[1]
                            or.push(obj)
                        })
                        query['$or'] = or
                } else if (o == '$regex') {
                    var field=req.query[o].match(/[^,]*/)[0],
                        regex=req.query[o].match(/,.*/)[0].substring(1)
                    query[field]={'$regex':regex}
                    console.log('$regex',field,regex)
                }else {
                    query[o] = req.query[o];
                }

            }
        }
        if(req.params.id) {
            Dao.get(req.params.db, req.params.collection,query,fields,options,function(err,doc){
                if (!err && !doc){
                    res.send(404)
                }else if (err){
                    res.json(500,err)
                }else{
                    res.json(200,doc)
                }
            })
        } else {
            Dao.query(req.params.db, req.params.collection,query,fields,options,function(err,docs){
                if (err){
                    res.json(500,err)
                }else{
                    res.json(200,docs)
                }
            })
        }
    });

    /**
     * Insert
     */
    app.post('/api/:db/:collection', function(req, res) {
        if(req.body) {
            var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {
                'auto_reconnect': true
            }));
            db.open(function(err, db) {
                //db.authenticate(config.db.username, config.db.password, function() {
                db.collection(req.params.collection, function(err, collection) {
                    // We only support inserting one document at a time
                    collection.insert(Array.isArray(req.body) ? req.body[0] : req.body, function(err, docs) {
                        res.header('Location', '/' + req.params.db + '/' + req.params.collection + '/' + docs[0]._id.toHexString());
                        res.header('Content-Type', 'application/json');
                        res.send('{"ok":1}', 201);
                        db.close();
                    });
                });
                //});
            });
        } else {
            res.header('Content-Type', 'application/json');
            res.send('{"ok":0}', 200);
        }
    });

    /**
     * Update
     */
    app.put('/api/:db/:collection/:id', function(req, res) {
        var spec = {
            '_id': new BSON.ObjectID(req.params.id)
        };

        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {
            'auto_reconnect': true
        }));
        db.open(function(err, db) {
            //db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                delete req.body._id
                collection.findAndModify(spec,[], req.body, {new:true,upsert:false}, function(err, doc) {
                    if (err){
                        res.json(500,err)
                    }else{
                        res.json(200,doc)
                    }
                    db.close();
                });
            });
            //});
        });
    });

    /**
     * Delete
     */
    app.del('/api/:db/:collection/:id', function(req, res) {
        var spec = {
            '_id': new BSON.ObjectID(req.params.id)
        };

        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {
            'auto_reconnect': true
        }));
        db.open(function(err, db) {
            //db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.remove(spec, function(err, docs) {
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}');
                    db.close();
                });
            });
            //});
        });
    });

}