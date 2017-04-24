/*
rest.js
mongodb-rest

Created by Tom de Grunt on 2010-10-03.
Copyright (c) 2010 Tom de Grunt.
This file is part of mongodb-rest.
*/
let RestfulMongoHttpHandler = require('restful-mongo-http-handlers');

function RestfulMongo(options) {
  options = options || {};
  this.options = options;
  this.handler = new RestfulMongoHttpHandler(options);
}
RestfulMongo.prototype.getDao = function() {
  let self = this;
  return self.Dao;
};
RestfulMongo.prototype.configure = function(app, options) {
  let self = this;
  options = options || {};

  if (options.methods) {
    let methods = options.methods;
    methods = methods.map(function(m) {
      return m.toLowerCase();
    });

    methods.indexOf('get') >= 0 && self._setGet(app);
    methods.indexOf('post') >= 0 && self._setPost(app);
    methods.indexOf('put') >= 0 && self._setPut(app);
    methods.indexOf('del') >= 0 && self._setDel(app);
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
};

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
  let self = this;
  app.post('/api/:db/:collection/query', self.handler.httpPost().query);
}

function _setPostForCount(app) {
  let self = this;
  app.post('/api/:db/:collection/count', self.handler.httpPost().count);
}

function _setPostForDistinct(app) {
  let self = this;
  app.post('/api/:db/:collection/distinct/:key', self.handler.httpPost().distinct);
}

function _setPost(app) {
  let self = this

  /**
   * Insert
   */
  app.post('/api/:db/:collection', self.handler.httpPost().post);
}

function _setGetForCount(app) {
  let self = this;
  app.get('/api/:db/:collection/count', self.handler.httpGet().count.bind(self.handler.httpGet()));
}

function _setGetForDistinct(app) {
  let self = this;
  app.get('/api/:db/:collection/distinct/:key', self.handler.httpGet().distinct.bind(self.handler.httpGet()));
}

function _setGet(app) {
  let self = this
  /**
   * Query
   */

  app.get('/api/:db/:collection/:id?', self.handler.httpGet().get.bind(self.handler.httpGet()));
}

function _setPut(app) {
  let self = this


  /**
   * Update
   */
  app.put('/api/:db/:collection/:id?', self.handler.httpPut().bind(self.handler.httpPut()));
}

function _setDel(app) {
  let self = this


  /**
   * Delete
   */
  app.delete('/api/:db/:collection/:id', self.handler.httpDelete());
}

module.exports = RestfulMongo