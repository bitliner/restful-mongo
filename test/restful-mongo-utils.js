'use strict';

var expect            = require('chai').expect;
var MongoUtils        = require('./utils/mongo-utils');
var request           = require('supertest');
var express           = require('express');
var restfulMongoUtils = require('../restful-mongo-utils.js');
var bodyParser        = require('body-parser');
var ObjectID          = require('mongodb').ObjectID;
var data              = require('./data/data');

var app               = express();

var mongoUtils = new MongoUtils({
	DB_URL: process.env.DB_URL
});
	
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var fixtures = require('pow-mongodb-fixtures').connect('test', {
	port: 27101
});

var options = {
	DATABASE_NAME: 'test', 
	HOST: '127.0.0.1',
	PORT: '27101'
};

app.put('/api/:db/:collection/:id?', restfulMongoUtils.getPutHttpHandler(options));
app.delete('/api/:db/:collection/:id?', restfulMongoUtils.getDeleteHttpHandler(options));

describe('restful-mongo-utils', function() {

	beforeEach(function(done) {
		console.log('BEFORE EACH');
		fixtures.clearAndLoad(data, function(err) {
			if (err) {
				console.log('Error while populating db');
			} else {
				console.log('Successfully populated db');
			}
			done();
		});
	});

	afterEach(function(done) {
		console.log('AFTER EACH');
		mongoUtils.queryAll('users', function(err, docs) {
			console.log('DOCS', JSON.stringify(docs, null, 4));
			done();
		});
	});

	describe('getPutHttpHandler', function() {

		var set = {
			'+$set': {
				name: 'newName'
			}
		};

		it('If the ObjectID is specified should change the name of the selected document', function(done) {
			request(app)
				.put('/api/local/users/571dcf6d265e5a69826b3160')
				.send(set)
				.set('Accept', 'application/json')
				.expect(200)
				.end(function(err, res) {
					expect(err).to.equal(null);
					expect(res.statusCode).to.equal(200);
					mongoUtils.query('users', {_id: new ObjectID('571dcf6d265e5a69826b3160')}, function(err, docs) {
						expect(docs[0].name).to.equal('newName');
						done();
					});
				});
		});

		it('If the ObjectID is not specified then should change the name of all the documents', function(done) {

			request(app)
				.put('/api/local/users/')
				.send(set)
				.expect(200)
				.end(function(err, res) {
					console.log(err);
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
	});

	describe('getDeleteHttpHandler', function() {
		
		describe('delete all the documents', function() {
			it('Should perform correctly the api call and delete all the documents from the collection', function(done) {
				request(app)
				.delete('/api/test/users')
				.expect(200)
				.end(function(err, res) {
					console.log('res', JSON.stringify(res, null, 4));
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
						expect(docs.length).to.equal(1);
						done();
					});
				});

			});
		});
	});
});