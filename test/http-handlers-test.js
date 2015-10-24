/* jshint node:true */
'use strict';

var request = require('supertest'),
	express = require('express'),
	expect = require('chai').expect,
	DbPopulator = require('./lib/db-populator');



var RestfulMongo = require('../');

describe('RESTful Mongo', function() {
	var httpApp;

	beforeEach(function(done) {
		httpApp = express();
		new RestfulMongo({
			HOST: 'localhost', // host of mongodb server, OPTIONAL
			PORT: 27017 // port of mongodb server, OPTIONAL  
		}).configure(httpApp);
		new DbPopulator({
			databaseName: 'test-db',
			data: require('./data/data')
		}).populate(done);
	});

	describe('GET methods', function() {

		it('should run query without any query parameters, but with sort and limit', function(done) {
			var url;

			url = '/api/test-db/greetings';
			url = url + '?rawOptions=' + encodeURIComponent(JSON.stringify({
				limit: 2,
				sort: {
					name: 1
				}
			}));
			request(httpApp)
				.get(url)
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function(err, res) {
					expect(err).to.be.eql(null);
					expect(res.body.length).to.be.eql(2);
					expect(res.body[0]).to.deep.eql({
						language: 'it',
						name: 'ciao',
						_id: '4ed2b809d7446b9a0e000014'
					});
					expect(res.body[1]).to.deep.eql({
						language: 'gb',
						name: 'good morning',
						_id: '4ed2b809d7446b9a0e000016'
					});
					done();
				});
		});


	});

});