/* eslint-env mocha */

const expect = require('chai').expect;
const Dao = require('../lib/connection/dao');
const fixtures = require('mongodb_fixtures').connect('test');

const MONGODB_URL = process.env.NODE_ENV || 'mongodb://localhost:27017/test';


const data = {
	saluti: [{
		saluto: 'ciao',
	}, {
		saluto: 'ola',
	}],
};

describe('Dao', function() {
	let dao;
	let databaseName;

	beforeEach(function(done) {
		dao = new Dao({
			url: MONGODB_URL,
		});
		databaseName = 'test';

		fixtures.clearAllAndLoad(data, done);
	});


	describe('get()', function() {
		it('By field', function(done) {
			dao.get(databaseName, 'saluti', {
				saluto: 'ciao',
			}, {}, {}, function(err, doc) {
				expect(err).to.be.eql(null);
				expect(doc).to.have.property('saluto', 'ciao');
				done();
			});
		});
	});

	describe('DAO query without hint', function() {
		it('By field', function(done) {
			dao.query(databaseName, 'saluti', {}, {}, {}, function(err, docs) {
				expect(err).to.be.eql(null);
				expect(docs.length).to.be.eql(2);
				done();
			});
		});
	});

	describe('DAO query with hint', function() {
		it('By field', function(done) {
			dao.query(databaseName, 'saluti', {}, {}, {
				hint: {
					saluto: 1,
				},
			}, function(err, docs) {
				expect(err).to.be.eql(null);
				expect(docs.length).to.be.eql(2);
				done();
			});
		});
	});

	describe('DAO queryAsCursor without hint', function() {
		it('By field', function(done) {
			dao.queryAsCursor(
				databaseName, 'saluti', {}, {}, {},
				function(err, cursor) {
					let lengthOfCursor = 0;
					cursor.each(function(err, item) {
						if (item == null) {
							expect(lengthOfCursor).to.be.eql(2);
							expect(err).to.be.eql(null);
							done();
						} else {
							lengthOfCursor++;
						}
					});
				});
		});
	});

	// TODO: check also if indexed are created
	describe('DAO queryAsCursor with hint', function() {
		it('By field', function(done) {
			dao.queryAsCursor(databaseName, 'saluti', {}, {}, {
				hint: {
					saluto: 1,
				},
			}, function(err, cursor) {
				let lengthOfCursor = 0;

				cursor.each(function(err, item) {
					if (item == null) {
						expect(lengthOfCursor).to.be.eql(2);
						expect(err).to.be.eql(null);
						done();
					} else {
						lengthOfCursor++;
					}
				});
			});
		});
	});

	describe('DAO queryAsCursor with batchSize', function() {
		let oneMilionOfObjects;
		let number;

		beforeEach(function(done) {
			oneMilionOfObjects = [];
			number = 100;
			for (let i = 0; i < number; i++) {
				oneMilionOfObjects.push({
					saluto: 'ciao',
				});
			}

			dao = new Dao({
				url: MONGODB_URL,
			});

			fixtures.clearAllAndLoad({
				saluti: oneMilionOfObjects,
			}, done);
		});

		it('By field', function(done) {
			dao.queryAsCursor(databaseName, 'saluti', {}, {}, {
				batchSize: 100,
			}, function(err, cursor) {
				let lengthOfCursor = 0;

				cursor.each(function(err, item) {
					if (item == null) {
						console.log('ola', lengthOfCursor);
						expect(lengthOfCursor).to.be.eql(number);
						expect(err).to.be.eql(null);
						done();
					} else {
						lengthOfCursor++;
					}
				});
			});
		});
	});

	describe('DAO remove', function() {
		let dataForRemove;
		beforeEach(function(done) {
			dataForRemove = {
				saluti: [{
					saluto: 'ciao',
				}, {
					saluto: 'ciao',
				}, {
					saluto: 'ola',
				}],
			};
			fixtures.clearAllAndLoad(dataForRemove, done);
		});

		it('Test remove more than one element', function(done) {
			dao.remove(databaseName, 'saluti', {
				saluto: 'ciao',
			}, {}, function(err, numberOfRemoved) {
				expect(err).to.be.eql(null);
				expect(numberOfRemoved).to.be.eql(2);

				dao.query(databaseName, 'saluti', {}, {}, {}, function(err, docs) {
					expect(docs.length).to.be.eql(1);
					done();
				});
			});
		});
	});
});