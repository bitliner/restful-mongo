var expect = require('chai').expect;
var express = require('express');

var RestfulMongo = require('../');

describe('RestfulMongo', function () {
    var app;
    var pathRoute;
    var restfulMongo;

    before(function () {
	app = express();
	restfulMongo = new RestfulMongo();
	
	restfulMongo.configure(app);

	pathRoute = {
	    get: [],
	    post: [],
	    put: [],
	    delete: []
	};
	
	// Get all router path for any http method
	app._router.stack.forEach(function (r) {
	    if (r.route && r.route.path) {
		var method = r.route.stack[0].method;
		pathRoute[method].push(r.route.path);
	    }
	});
    });

    describe('when use the HTTP GET method', function () {
	it('should exists the count API', function () {
	    expect(pathRoute.get.indexOf('/api/:db/:collection/count')).to.not.equal(-1);
	});

	it('should exists the distinct API', function () {
	    expect(pathRoute.get.indexOf('/api/:db/:collection/distinct/:key')).to.not.equal(-1);
	});

	it('should exists the get API', function () {
	    expect(pathRoute.get.indexOf('/api/:db/:collection/:id?')).to.not.equal(-1);
	});
    });

    describe('when use the HTTP POST method', function () {
	it('should exists the count API', function () {
	    expect(pathRoute.post.indexOf('/api/:db/:collection/count')).to.not.equal(-1);
	});

	it('should exists the distinct API', function () {
	    expect(pathRoute.post.indexOf('/api/:db/:collection/distinct/:key')).to.not.equal(-1);
	});

	it('should exists the post API', function () {
	    expect(pathRoute.post.indexOf('/api/:db/:collection')).to.not.equal(-1);
	});
	
	it('should exists the query API', function () {
	    expect(pathRoute.post.indexOf('/api/:db/:collection/query')).to.not.equal(-1);
	});
    });
    
    describe('when use the HTTP PUT method', function () {
	it('should exists the put API', function () {
	    expect(pathRoute.put.indexOf('/api/:db/:collection/:id?')).to.not.equal(-1);
	});
    });

    describe('when use the HTTP DELETE method', function () {
	it('should exists the delete API', function () {
	    expect(pathRoute.delete.indexOf('/api/:db/:collection/:id')).to.not.equal(-1);
	});
    });
});

