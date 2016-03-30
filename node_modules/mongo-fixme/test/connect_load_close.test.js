var fixtures = require('../src/index.js'),
    dbName = 'mongo-fixme-test';

exports['closeDb'] = function(test) {
	var db = fixtures.connect(dbName);
	db.load({}, function(){
		db.close(function() {
			test.done();
		});
	});
};
