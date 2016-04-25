'use strict';

var ObjectID = require('mongodb').ObjectID;

module.exports = {
	users: [
		{
			_id: new ObjectID.createFromHexString('571dcf6d265e5a69826b3160'),
			name: 'pippo'
		},
		{
			_id: ObjectID.createFromHexString('571dcf75265e5a69826b3161'),
			name: 'pluto'
		}
	]
};