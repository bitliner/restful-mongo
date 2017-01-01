/* eslint-env mocha */
let ConnPool = require('../lib/connection/connectionPool.js');
let expect = require('chai').expect;

let mongoDbHost = process.env.MONGODB_HOST;
let databaseName = 'test';


describe('connectionPool', function() {
	let connPool;

	describe('should calculate the correct URL connection', function() {
		beforeEach(function() {
			connPool = new ConnPool({
				DATABASE_NAME: databaseName,
				MONGODB_HOST: mongoDbHost,
			});
		});

		describe('Get connection', function() {
			it('Without usenname and host/port', function(done) {
				let url = connPool._getConnectionUrl();
				expect(url).to.be.eql('mongodb://localhost:27017/test');
				done();
			});
		});
	});
});
