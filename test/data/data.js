/* jshint node:true */
'use strict';


var id = require('pow-mongodb-fixtures').createObjectId;

module.exports.greetings = [{
	_id: id('4ed2b809d7446b9a0e000014'),
	name: 'ciao',
	language: 'it'
}, {
	_id: id('4ed2b809d7446b9a0e000015'),
	name: 'hello',
	language: 'gb'
}, {
	_id: id('4ed2b809d7446b9a0e000016'),
	name: 'good morning',
	language: 'gb'
}];