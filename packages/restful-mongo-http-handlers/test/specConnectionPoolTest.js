var ConnPool = require('../lib/connection/connectionPool.js');
var expect = require('chai').expect

var mongoDbUrl = process.env.DB_URL;
var mongoDbHost = process.env.MONGODB_HOST;
var databaseName = process.env.DB_NAME;


describe('TEST', function() {
	var connPool;

	beforeEach(function(done) {
		connPool = new ConnPool({
			DATABASE_NAME: databaseName,
			MONGODB_HOST: mongoDbHost
		});
		done();
	});

	describe('Get connection', function() {
		it('Without usenname and host/port', function(done) {
			var url = connPool._getConnectionUrl()

			expect(url).to.be.eql(mongoDbUrl)
			done()
		})
	})
})