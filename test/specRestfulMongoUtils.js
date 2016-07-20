'use strict';

var expect = require('chai').expect;
var MongoUtils = require('./utils/mongo-utils');
var request = require('supertest');
var express = require('express');
var restfulMongoUtils = require('../');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;
var data = require('./data/data');

var mongoUtils = new MongoUtils({
    DB_URL: process.env.DB_URL
});



var fixtures = require('pow-mongodb-fixtures').connect('test', {
    port: 27017
});



describe('restful-mongo-utils', function() {
    var app;
    var handler;

    before(function () {
	handler = new restfulMongoUtils({
	    DATABASE_NAME: 'test',
	    HOST: '127.0.0.1',
	    PORT: '27017'
	});
    });

    beforeEach(function(done) {
	// setup the app
	app = express();
	app.use(bodyParser.urlencoded({
	    extended: false
	}));
	app.use(bodyParser.json());
	app.put('/api/:db/:collection/:id?', handler.httpPut().service());
	app.delete('/api/:db/:collection/:id?', handler.httpDelete().service());
	app.get('/api/:db/:collection/count', handler.httpGet().service().count);
	app.get('/api/:db/:collection/:id?', handler.httpGet().service().get);
	app.get('/api/:db/:collection/distinct/:key', handler.httpGet().service().distinct);
	app.post('/api/:db/:collection', handler.httpPost().service());
	fixtures.clearAndLoad(data, done);
    });

    afterEach(function(done) {
	mongoUtils.queryAll('users', done);
    });

    describe('handler.httpGet.service', function () {
	describe('when is request the "get" service', function () {
	    it('should get all document in a specific collection if the ObjectId is not specified', function (done) {
		request(app)
		.get('/api/local/users/')
		.expect(200)
		.end(function (err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.instanceOf(Array);
		    expect(res.body.length).to.equal(data.users.length);
		    done()
		});
	    });

	    it('should get the specific document in a collection if the ObjectId is specified', function (done) {
		request(app)
		.get('/api/test/users/571dcf6d265e5a69826b3160')
		.expect(200)
		.end(function (err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.eql({ 
			_id: '571dcf6d265e5a69826b3160', 
			name: 'pippo' 
		    });
		    done()
		});
	    });
	});

	describe('when is request the "distinct" service', function () {
	    it('should get the set of user\'s distinct name', function (done) {
		request(app)
		.get('/api/test/users/distinct/name')
		.expect(200)
		.end(function (err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.eql(['pippo', 'pluto']);
		    done()
		});
	    });
	});

	describe('when is request the "count" service', function () {
	    it('should get the number of users stored into the db', function (done) {
		request(app)
		.get('/api/test/users/count')
		.expect(200)
		.end(function (err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.a('string');
		    expect(res.body).to.equal(data.users.length.toString());
		    done();
		});
	    });
	});
    });

    describe('handler.httpPost.service', function () {
	var user;
	
	before(function () {
	    user = {
		name: 'bravoh'
	    };
	});

	it('should save the document was sended by POST', function (done) {
	    request(app)
	    .post('/api/test/users')
	    .send(user)
	    .set('Accept', 'application/json')
	    .expect(200)
	    .end(function (err, res) {
		expect(err).to.equal(null);
		expect(res.statusCode).to.equal(200);
		expect(res.body.name).to.equal(user.name);
		done();
	    });
	});
    });

    describe('handler.httpPut.service', function() {
	var set;

	beforeEach(function() {
	    set = {
		'+$set': {
		    name: 'newName'
		}
	    };
	});


	it('If the ObjectID is specified should change the name of the selected document', function(done) {
	    request(app)
		.put('/api/local/users/571dcf6d265e5a69826b3160')
		.send({
		    update: set
		})
		.set('Accept', 'application/json')
		.expect(200)
		.end(function(err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.eql({
			_id: '571dcf6d265e5a69826b3160',
			name: 'newName'
		    });
		    mongoUtils.query('users', {}, function(err, docs) {
			console.log('docs', JSON.stringify(docs));
			expect(docs[0].name).to.equal('newName');
			docs.slice(0).forEach(function(doc) {
			    expect(doc).to.not.equal('newName');
			});
			done();
		    });
		});
	});

	it('If the ObjectID is not specified then should change the name of all the documents', function(done) {

	    request(app)
		.put('/api/local/users/')
		.send({
		    update: set
		})
		.expect(200)
		.end(function(err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    mongoUtils.queryAll('users', function(err, docs) {
			docs.forEach(function(doc) {
			    expect(doc.name).to.equal('newName');
			});
			done();
		    });
		});
	});
	it('when ObjectId is specified as fake ObjectId into the query field, then the update should work fine anyway', function(done) {

	    request(app)
		.put('/api/local/users/')
		.send({
		    query: {
			_id: 'ObjectId("571dcf6d265e5a69826b3160")',
		    },
		    update: set
		})
		.expect(200)
		.end(function(err, res) {
		    expect(err).to.equal(null);
		    expect(res.statusCode).to.equal(200);
		    expect(res.body).to.be.eql(1);
		    mongoUtils.query('users', {}, function(err, docs) {
			console.log('docs', JSON.stringify(docs));
			expect(docs[0].name).to.equal('newName');
			docs.slice(0).forEach(function(doc) {
			    expect(doc).to.not.equal('newName');
			});
			done();
		    });
		});
	});
    });

    describe('handler.httpDelete.service', function() {

	describe('delete all the documents', function() {
	    it('Should perform correctly the api call and delete all the documents from the collection', function(done) {
		request(app)
		    .delete('/api/test/users')
		    .expect(200)
		    .end(function(err, res) {
			//console.log('res', JSON.stringify(res, null, 4));
			expect(err).to.equal(null);
			expect(res.status).to.equal(200);
			mongoUtils.queryAll('users', function(err, docs) {
			    expect(err).to.equal(null);
			    expect(docs.length).to.equal(0);
			    done();
			});
		    });
	    });
	});

	describe('Delete one document', function() {

	    it('Should delete the document specified in the param of the url', function(done) {

		request(app)
		    .delete('/api/test/users/571dcf6d265e5a69826b3160')
		    .expect(200)
		    .end(function(err, res) {
			expect(err).to.equal(null);
			expect(res.status).to.equal(200);
			mongoUtils.queryAll('users', function(err, docs) {
			    expect(err).to.equal(null);
			    expect(docs.length).to.equal(2);
			    done();
			});
		    });

	    });
	});
    });
});
