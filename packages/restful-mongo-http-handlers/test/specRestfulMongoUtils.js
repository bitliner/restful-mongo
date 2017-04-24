'use strict';
/* globals before, it */

let expect = require('chai').expect;
let MongoUtils = require('./utils/mongo-utils');
let request = require('supertest');
let express = require('express');
let RestfulMongoUtils = require('../');
let bodyParser = require('body-parser');
let data = require('./data/data');

let mongoDbUrl = process.env.NODE_ENV;
let databaseName = process.env.DB_NAME;
let mongodbHost = process.env.MONGODB_HOST;
let mongodbPort = process.env.MONGODB_PORT;

// 
// 
// 
// 


let mongoUtils = new MongoUtils({
	DB_URL: mongoDbUrl,
});

let fixtures = require('mongodb_fixtures').connect('test');

describe('restful-mongo-utils', function() {
	let app;
	let handler;

	beforeEach(function() {
		handler = new RestfulMongoUtils({
			DATABASE_NAME: databaseName,
			HOST: mongodbHost,
			PORT: mongodbPort,
		});
	});

	beforeEach(function(done) {
		// setup the app
		app = express();
		app.use(bodyParser.urlencoded({
			extended: false,
		}));
		app.use(bodyParser.json());
		app.put('/api/:db/:collection/:id?', handler.httpPut());
		app.delete('/api/:db/:collection/:id?', handler.httpDelete());
		app.get('/api/:db/:collection/count',
			handler.httpGet().count.bind(handler.httpGet()));
		app.get('/api/:db/:collection/:id?',
			handler.httpGet().get.bind(handler.httpGet()));
		app.get('/api/:db/:collection/distinct/:key',
			handler.httpGet().distinct.bind(handler.httpGet()));
		app.post('/api/:db/:collection/query', handler.httpPost().query);
		app.post('/api/:db/:collection', handler.httpPost().post);
		// TODO: make test to query, distinct, count service post methods
		fixtures.clearAndLoad(data, done);
	});

	// afterEach(function(done) {
	// mongoUtils.queryAll('users', done);
	// });

	describe('GET', function() {
		describe('via GET', function() {
			describe('/api/dbName/collectionName', function() {
				it('should get all documents', function(done) {
					request(app)
						.get('/api/test/users')
						.expect(200)
						.end(function(err, res) {
							expect(err).to.equal(null);
							expect(res.statusCode).to.equal(200);
							expect(res.body).to.be.instanceOf(Array);
							expect(res.body.length).to.equal(data.users.length);
							done();
						});
				});

				describe('when the query includes a regex', function() {
					let rawQueryParameter;

					beforeEach(function() {
						rawQueryParameter = encodeURIComponent(JSON.stringify({
							name: {
								$regex: '/pluto/gi',
							},
						}));
					});
					it('should return the correct documents', function(done) {
						request(app)
							.get('/api/test/users?rawQuery=' + rawQueryParameter)
							.expect(200)
							.end(function(err, res) {
								expect(err).to.equal(null);
								expect(res.statusCode).to.equal(200);
								expect(res.body.length).to.be.eql(2);
								expect(res.body[1].name).to.be.eql('pluto');
								done();
							});
					});
				});
			});

			describe('/api/dbName/collectionName/ID', function() {
				it('should get only one document', function(done) {
					request(app)
						.get('/api/test/users/571dcf6d265e5a69826b3160')
						.expect(200)
						.end(function(err, res) {
							expect(err).to.equal(null);
							expect(res.statusCode).to.equal(200);
							expect(res.body).to.be.eql({
								_id: '571dcf6d265e5a69826b3160',
								date: '1970-02-01T12:31:11.153Z',
								name: 'pippo',
							});
							done();
						});
				});
			});

			describe('/api/dbName/collectionName/distinct/fieldName', function() {
				it('should get the set of user\'s distinct name', function(done) {
					request(app)
						.get('/api/test/users/distinct/name')
						.expect(200)
						.end(function(err, res) {
							expect(err).to.equal(null);
							expect(res.statusCode).to.equal(200);
							expect(res.body).to.be.eql(['pippo', 'pluto']);
							done();
						});
				});
			});

			describe('/api/dbName/collectionName/count', function() {
				it('should get the number of users stored into the db', function(done) {
					request(app)
						.get('/api/test/users/count')
						.expect(200)
						.end(function(err, res) {
							expect(err).to.equal(null);
							expect(res.statusCode).to.equal(200);
							expect(res.body).to.be.a('string');
							expect(res.body)
								.to.equal(data.users.length.toString());
							done();
						});
				});
			});
		});

		describe('via POST', function() {
			describe('/api/dbName/collectionName/query/', function() {
				describe('when the query includes ISODate as string', function() {
					let query;

					describe('when the query includes $or operator', function() {
						beforeEach(function() {
							query = {
								'+$or': [{
									date: {
										'+$lte': 'ISODate(\'2013-07-01T12:00:00.000Z\')',
									},
								}],
							};
						});
						it('should return the correct documents', function(done) {
							request(app)
								.post('/api/test/users/query')
								.send({
									query: query,
								})
								.expect(200)
								.end(function(err, res) {
									expect(err).to.equal(null);
									expect(res.statusCode).to.equal(200);
									expect(res.body.length).to.be.eql(2);
									done();
								});
						});
					});
				});
			});
		});
	});

	describe('POST', function() {
		let user;

		before(function() {
			user = {
				name: 'bravoh',
			};
		});

		it('should save the document was sended by POST', function(done) {
			request(app)
				.post('/api/test/users')
				.send(user)
				.set('Accept', 'application/json')
				.expect(200)
				.end(function(err, res) {
					expect(err).to.equal(null);
					expect(res.statusCode).to.equal(200);
					expect(res.body.name).to.equal(user.name);
					done();
				});
		});
	});

	describe('PUT', function() {
		let set;

		beforeEach(function() {
			set = {
				'+$set': {
					name: 'newName',
				},
			};
		});

		describe('when ObjectId is specified', function() {
			it('should change name of the selected document', function(done) {
				request(app)
					.put('/api/test/users/571dcf6d265e5a69826b3160')
					.send({
						update: set,
					})
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err, res) {
						expect(err).to.equal(null);
						expect(res.statusCode).to.equal(200);
						expect(res.body).to.be.eql({
							_id: '571dcf6d265e5a69826b3160',
							date: '1970-02-01T12:31:11.153Z',
							name: 'newName',
						});
						mongoUtils.query('users', {}, function(err, docs) {
							
							expect(docs[0].name).to.equal('newName');
							docs.slice(0).forEach(function(doc) {
								expect(doc).to.not.equal('newName');
							});
							done();
						});
					});
			});
		});

		describe('when ObjectId is not specified', function() {
			it('should change the name of all the documents', function(done) {
				request(app)
					.put('/api/test/users/')
					.send({
						update: set,
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
		});

		describe('when ObjectID is specified as string', function() {
			it('should work anyway', function(done) {
				request(app)
					.put('/api/test/users/')
					.send({
						query: {
							_id: 'ObjectId("571dcf6d265e5a69826b3160")',
						},
						update: set,
					})
					.expect(200)
					.end(function(err, res) {
						expect(err).to.equal(null);
						expect(res.statusCode).to.equal(200);
						expect(res.body.n).to.be.eql(1);
						expect(res.body.nModified).to.be.eql(1);
						expect(res.body.ok).to.be.eql(1);
						mongoUtils.query('users', {}, function(err, docs) {
							
							expect(docs[0].name).to.equal('newName');
							docs.slice(0).forEach(function(doc) {
								expect(doc).to.not.equal('newName');
							});
							done();
						});
					});
			});
		});
	});

	describe('DELETE', function() {
		describe('/api/dbName/collectionName', function() {
			it('Should delete all documents', function(done) {
				request(app)
					.delete('/api/test/users')
					.expect(200)
					.end(function(err, res) {
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

		describe('/api/dbName/collectionName/docID', function() {
			it('Should delete one only document', function(done) {
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