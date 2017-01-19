/*
rest.js
mongodb-rest

Created by Tom de Grunt on 2010-10-03.
Copyright (c) 2010 Tom de Grunt.
This file is part of mongodb-rest.
*/
var mongo = require("mongodb");
var BSON = mongo.BSONPure;
var RestfulMongoHttpHandler = require('restful-mongo-http-handlers');
var Logger = require('logb').getLogger(module.filename);

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
    this.handler = new RestfulMongoHttpHandler(options);
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
	self._setPostForCount(app);
	self._setGetForDistinct(app);
	self._setPostForDistinct(app);
	self._setGet(app);
	self._setPost(app);
	self._setPut(app);
	self._setDel(app);
	self._setPostQuery(app);
    }
}

RestfulMongo.prototype._setGetForCount = _setGetForCount;
RestfulMongo.prototype._setPostForCount = _setPostForCount;
RestfulMongo.prototype._setGetForDistinct = _setGetForDistinct;
RestfulMongo.prototype._setPostForDistinct = _setPostForDistinct;
RestfulMongo.prototype._setGet = _setGet;
RestfulMongo.prototype._setDel = _setDel;
RestfulMongo.prototype._setPut = _setPut;
RestfulMongo.prototype._setPost = _setPost;
RestfulMongo.prototype._setPostQuery = _setPostQuery;

function _setPostQuery(app) {
    var self = this;
    app.post('/api/:db/:collection/query', self.handler.httpPost().query);
}

function _setPostForCount(app) {
    var self = this;
    app.post('/api/:db/:collection/count', self.handler.httpPost().count);
}

function _setPostForDistinct(app) {
    var self = this;
    app.post('/api/:db/:collection/distinct/:key', self.handler.httpPost().distinct);
}

function _setPost(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring POST')
    /**
     * Insert
     */
    app.post('/api/:db/:collection', self.handler.httpPost().post);
}

function _setGetForCount(app) {
    var self = this;
    app.get('/api/:db/:collection/count', self.handler.httpGet().count);
}

function _setGetForDistinct(app) {
    var self = this;
    app.get('/api/:db/:collection/distinct/:key', self.handler.httpGet().distinct);
}

function _setGet(app) {
    var self = this
        /**
         * Query
         */
    console.log('RESTful Mongo', 'Configuring GET')
    app.get('/api/:db/:collection/:id?', self.handler.httpGet().get.bind(self.handler.httpGet()));
}

function _setPut(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring PUT')

    /**
     * Update
     */
    app.put('/api/:db/:collection/:id?', self.handler.httpPut());
}

function _setDel(app) {
    var self = this
    console.log('RESTful Mongo', 'Configuring DEL')

    /**
     * Delete
     */
    app.delete('/api/:db/:collection/:id', self.handler.httpDelete());
}

module.exports = RestfulMongo
