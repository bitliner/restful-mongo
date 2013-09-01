var ConnPool = require('../lib/ConnectionPool.js'),
	expect = require('chai').expect







describe('TEST', function() {
	var connPool;



	beforeEach(function(done) {


		

		done()

	})


	describe('Get connection', function() {

		it('Without usenname and host/port', function(done) {

			var options={
				DATABASE_NAME:'ciao'
			}
			connPool=new ConnPool(options)

			var url=connPool._getConnectionUrl(options)

			expect(url).to.be.eql('mongodb://localhost:27017/ciao')
			done()
		})




	})


})