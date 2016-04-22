'use strict';

var expect            = require('chai').expect;
var MongoUtils        = require('./utils/mongo-utils');
var request           = require('supertest');
var express           = require('express');
var restfulMongoUtils = require('../restful-mongo-utils.js');
var bodyParser        = require('body-parser');

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
	DATABASE_NAME: 'local', 
	HOST: '127.0.0.1',
	PORT: '27101'
};

app.put('/api/:db/:collection/:id?', restfulMongoUtils.getPutHttpHandler(options));
app.delete('/api/:db/:collection/:id?', restfulMongoUtils.getDeleteHttpHandler(options));

describe('restful-mongo-utils', function() {

	beforeEach(function(done) {
		fixtures.clearAllAndLoad(data, function(err) {
			if (err) {
				console.log('Error while populating db');
			} else {
				console.log('Successfully populated db');
			}
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
				.put('/api/local/users/570e6a4e06f71e366a6cada3')
				.send(set)
				.set('Accept', 'application/json')
				.expect(200)
				.end(function(err, res) {
					expect(err).to.be.null;
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.not.be.undefined;
					expect(res.body.name).to.equal('newName');
					done();
				});
		});

		it('If the ObjectID is not specified then should change the name of all the documents', function(done) {

			request(app)
				.put('/api/local/users/')
				.send(set)
				.expect(200)
				.end(function(err, res) {
					console.log(err);
					expect(err).to.be.null;
					expect(res.statusCode).to.equal(200);
					expect(res.body).to.not.be.undefined;
					expect(res.body).to.be.above(1);
					done();	
				});
		});
	});

	describe('getDeleteHttpHandler', function() {
		
		var err, docs;

		beforeEach(function(done) {
			mongoUtils.queryAll('users', function(_err, _docs) {
				err = _err;
				docs = _docs;
				done();
			});
		});

		it('', function() {
			expect(err).to.equal(null);
			expect(docs).to.not.be.undefined;
			console.log(docs);
		});
	});
});