var ConnPool = require('../lib/ConnectionPool.js'),
    expect = require('chai').expect







describe('RestfulMongo', function() {
    var connPool;





    describe('Connection pool', function() {

        it('should calculate right connection URL', function(done) {

            var options = {
                DATABASE_NAME: 'ciao'
            }
            var url = ConnPool._getConnectionUrl(options)

            expect(url).to.be.eql('mongodb://localhost:27017/ciao')
            done()
        });




    })


})