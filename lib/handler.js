var Dao = require('./connection/dao');
var HandlerHttpDelete = require('./http_handler/delete');
var HandlerHttpGet = require('./http_handler/get');
var HandlerHttpPost = require('./http_handler/post');
var HandlerHttpPut = require('./http_handler/put');

var handlerHttpDelete;
var handlerHttpGet;
var handlerHttpPost;
var handlerHttpPut;

function Handler(options) {
    options = options || {};
    this.dao = new Dao(options);

    handlerHttpDelete = new HandlerHttpDelete(this.dao);
    handlerHttpGet = new HandlerHttpGet(this.dao);
    handlerHttpPost = new HandlerHttpPost(this.dao);
    handlerHttpPut = new HandlerHttpPut(this.dao);
}

Handler.prototype.httpDelete = function () {
    return handlerHttpDelete;
};

Handler.prototype.httpGet = function () {
    return handlerHttpGet;
};

Handler.prototype.httpPost = function () {
    return handlerHttpPost;
};

Handler.prototype.httpPut = function () {
    return handlerHttpPut;
};

module.exports = Handler;
