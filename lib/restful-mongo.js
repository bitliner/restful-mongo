/* jshint node:true */
'use strict';

/*
rest.js
mongodb-rest

Created by Tom de Grunt on 2010-10-03.
Copyright (c) 2010 Tom de Grunt.
This file is part of mongodb-rest.
*/
var DaoModule = require('./Dao.js'),
	Logger = require('logb').getLogger(module.filename);


var HttpGet = require('./http-handlers/get');
var HttpPost = require('./http-handlers/post');
var HttpPut = require('./http-handlers/put');
var HttpDelete = require('./http-handlers/delete');

function RestfulMongo(options) {
	var self = this;
	options = options || {};
	this.options = options;
	self.Dao = new DaoModule(this.options);
}
RestfulMongo.prototype.getDao = function() {
	var self = this;
	return self.Dao;
};
RestfulMongo.prototype.configure = function(app, opts) {

	Logger.info('Configuring Http handlers...');

	var self = this;

	opts = opts || {};

	self._setGetForCount(app);
	self._setGetForDistinct(app);
	self._setGet(app);
	self._setPost(app);
	self._setPut(app);
	self._setDel(app);
};


RestfulMongo.prototype._setGetForCount = function _setGetForCount(app) {
	app.get('/api/:db/:collection/count', HttpGet.count.bind(this));
};
RestfulMongo.prototype._setGetForDistinct = function _setGetForDistinct(app) {
	app.get('/api/:db/:collection/distinct/:key', HttpGet.distinct.bind(this));
};
RestfulMongo.prototype._setGet = function _setGet(app) {
	app.get('/api/:db/collections', HttpGet.collections.bind(this));
	app.get('/api/:db/:collection/:id?', HttpGet.query.bind(this));
};
RestfulMongo.prototype._setDel = function _setDel(app) {
	app.del('/api/:db/:collection/:id', HttpDelete.remove.bind(this));
};
RestfulMongo.prototype._setPut = function _setPut(app) {
	app.put('/api/:db/:collection/:id', HttpPut.update.bind(this));
};
RestfulMongo.prototype._setPost = function _setPost(app) {
	app.post('/api/:db/:collection', HttpPost.insert.bind(this));
	app.post('/api/:db/:collection/query', HttpPost.query.bind(this));
};


module.exports = RestfulMongo;