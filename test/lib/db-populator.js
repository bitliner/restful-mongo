/* jshint node:true */
'use strict';



function DbPopulator(options) {
	var self = this;

	options = options || {};


	self.databaseName = options.databaseName || 'test';
	self.host = options.host || 'localhost';
	self.port = options.port || 27017;
	self.data = options.data;
	self.user = options.user || null;
	self.password = options.password || null;

	self.fixtures = require('pow-mongodb-fixtures').connect(self.databaseName, {
		host: self.host,
		port: self.port,
		user: self.user,
		pass: self.password
	});
}

DbPopulator.prototype.populate = function(cb) {

	this.fixtures.clearAllAndLoad(this.data, function(err) {
		if (err) {
			console.log('Error', err);
		}
		if (cb) {
			cb(err);
		}
	});
};

module.exports = DbPopulator;