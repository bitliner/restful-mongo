var ConnPool = require('../lib/connection/connectionPool.js'),
expect = require('chai').expect

describe('TEST', function() {
    var connPool;

    beforeEach(function(done) {
	connPool = new ConnPool({
	    DATABASE_NAME: 'ciao'
	})
	done()
    })

    describe('Get connection', function() {
	it('Without usenname and host/port', function(done) {
	    var url = connPool._getConnectionUrl()

	    expect(url).to.be.eql('mongodb://localhost:27017/ciao')
	    done()
	})
    })
})
