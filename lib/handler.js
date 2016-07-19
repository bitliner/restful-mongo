var Dao = require('./dao');
var HandlerHttpDelete = require('./http_handler/delete');
var HandlerHttpGet = require('./http_handler/get');
var HandlerHttpPush = require('./http_handler/push');
var HandlerHttpPut = require('./http_handler/put');

var handlerHttpDelete;
var handlerHttpGet;
var handlerHttpPush;
var handlerHttpPut;

function Handler(options) {
    this.options = options || {};
    this.dao = new Dao(this.options);

    handlerHttpDelete = new HandlerHttpDelete(this.options);
    handlerHttpGet = new HandlerHttpGet(this.dao);
    handlerHttpPush = new HandlerHttpPush(this.dao);
    handlerHttpPut = new HandlerHttpPut(this.options);
}

Handler.prototype.httpDelete = function () {
    return handlerHttpDelete;
};

Handler.prototype.httpGet = function () {
    return handlerHttpGet;
};

Handler.prototype.httpPush = function () {
    return handlerHttpPush;
};

Handler.prototype.httpPut = function () {
    return handlerHttpPut;
};

module.exports = Handler;
