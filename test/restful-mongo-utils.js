'use strict';

var expect = require('chai').expect;
var request = require('supertest');
var express = require('express');
var restfulMongoUtils = require('../restful-mongo-utils.js');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var fixtures = require('mongo-fixme').connect('local', {
	port: 27101
});

fixtures.load(__dirname + '/data/users.js');

var options = {
	DATABASE_NAME: 'local', 
	HOST: '127.0.0.1',
	PORT: '27101'
};

app.put('/api/:db/:collection/:id?', restfulMongoUtils.getPutHttpHandler(options));

describe('restful-mongo-utils', function() {

	describe('getPutHttpHandler', function() {

		var set = {
			'+$set': {
				name: 'newName'
			}
		};

		it('If the ObjectID is specified should change the name of the selected document', function(done) {
			request(app)
				.put('/api/local/users/56fd102ff287ba374c4a57f1')
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
					expect(res.body).to.have.length.above(1);
					res.body.forEach(function(item) {
						expect(item.name).to.equal('newName');
					});
					done();	
				});
		});
	});
});