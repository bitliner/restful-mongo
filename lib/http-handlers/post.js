/* jshint node:true */
'use strict';

var QueryManipulator = require('../utils/query-manipulator'),
	Logger = require('logb').getLogger(module.filename);

module.exports.insert = function(req, res) {
	this.Dao.save(req.params.host, req.params.db, req.params.collection, req.body, function(err, doc) {
		if (err) {
			return res.json(500, err);
		}
		res.json(200, doc);
	});
};

module.exports.query = function(req, res) {

	var query,
		options,
		fields;

	query = req.body.query || {};
	options = req.body.options || {};
	fields = req.body.fields || {};

	query = QueryManipulator.unescapeMongoDbModifiers(query);

	this.Dao.query(req.params.db, req.params.collection, query, fields, options, function(err, docs) {
		if (err) {
			Logger.error('Error', err);
			return res.json(500, err);
		}
		res.json(200, docs);
	});
};