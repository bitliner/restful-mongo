'use strict';

// var ObjectID = require('mongodb').ObjectID;
let id = require('mongodb_fixtures').createObjectId;


module.exports = {
	users: [{
		_id: id('571dcf6d265e5a69826b3160'),
		name: 'pippo',
	}, {
		_id: id('571dcf75265e5a69826b3161'),
		name: 'pluto',
	}, {
		_id: id('571dcf75265e5a69826b3162'),
		name: 'pluto',
	}],
};