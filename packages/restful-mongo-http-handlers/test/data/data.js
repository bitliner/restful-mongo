'use strict';

// var ObjectID = require('mongodb').ObjectID;
let id = require('mongodb_fixtures').createObjectId;


module.exports = {
	users: [{
		_id: id('571dcf6d265e5a69826b3160'),
		name: 'pippo',
		date: new Date(Date.parse('1970-02-01T12:31:11.153Z')),
	}, {
		_id: id('571dcf75265e5a69826b3161'),
		name: 'pluto',
		date: new Date(Date.parse('1970-02-01T12:31:11.153Z')),
	}, {
		_id: id('571dcf75265e5a69826b3162'),
		name: 'pluto',
		date: new Date(Date.parse('2017-02-01T12:31:11.153Z')),
	}],
};