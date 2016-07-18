var request = require('request'),
	expect = require('chai').expect,
	DbPopulator = require('./DbPopulator.js'),
	path = require('path'),
	RestfulMongo = require('../index.js');



var data = {
	saluti: [{
		saluto: 'ciao',
	}, {
		saluto: 'ola'
	}]
}



describe('TEST', function() {
	var dao;



	beforeEach(function(done) {


		dao = new RestfulMongo({
			url: 'mongodb://rest:ful@localhost:27017/restfulMongo'
		}).getDao()

		new DbPopulator({
			databaseName: 'restfulMongo',
			data: data,
			user: 'rest',
			password: 'ful'
		}).execute().then(function() {
			console.log('DbPopulator executed')
			done()
		})

	})


	describe('DAO get', function() {

		it('By field', function(done) {

			dao.get('restfulMongo', 'saluti', {
				saluto: 'ciao'
			}, {}, {}, function(err, doc) {


				expect(err).to.be.eql(null)
				expect(doc).to.have.property('saluto', 'ciao')

				done()
			})
		})
	})

	describe('DAO query without hint', function() {

		it('By field', function(done) {

			dao.query('restfulMongo', 'saluti', {}, {}, {}, function(err, docs) {

				expect(err).to.be.eql(null)
				expect(docs.length).to.be.eql(2)

				done()
			})
		})
	})

	describe('DAO query with hint', function() {

		it('By field', function(done) {

			dao.query('restfulMongo', 'saluti', {}, {}, {
				hint: {
					saluto: 1
				}
			}, function(err, docs) {

				expect(err).to.be.eql(null)
				expect(docs.length).to.be.eql(2)

				done()
			})
		})
	})

	describe('DAO queryAsCursor without hint', function() {

		it('By field', function(done) {

			dao.queryAsCursor('restfulMongo', 'saluti', {}, {}, {}, function(err, cursor) {
				var lengthOfCursor = 0;

				cursor.each(function(err, item) {
					if(item == null) {
						expect(lengthOfCursor).to.be.eql(2)
						expect(err).to.be.eql(null)
						done()
					} else {
						lengthOfCursor++
					}

				})

			})
		})
	})

	// TODO: check also if indexed are created
	describe('DAO queryAsCursor with hint', function() {

		it('By field', function(done) {

			dao.queryAsCursor('restfulMongo', 'saluti', {}, {}, {
				hint: {
					saluto: 1
				}
			}, function(err, cursor) {
				var lengthOfCursor = 0;

				cursor.each(function(err, item) {
					if(item == null) {
						expect(lengthOfCursor).to.be.eql(2)
						expect(err).to.be.eql(null)
						done()
					} else {
						lengthOfCursor++
					}

				})

			})
		})
	})

	describe('DAO queryAsCursor with batchSize', function() {
		var oneMilionOfObjects, number;

		beforeEach(function(done) {
			oneMilionOfObjects = []
			number = 10000;
			for(var i = 0; i < number; i++) {
				oneMilionOfObjects.push({
					saluto: 'ciao'
				})
			}

			dao = new RestfulMongo({
				url: 'mongodb://rest:ful@localhost:27017/restfulMongo'
			}).getDao()

			new DbPopulator({
				databaseName: 'restfulMongo',
				data: {
					saluti: oneMilionOfObjects
				},
				user: 'rest',
				password: 'ful'
			}).execute().then(function() {
				console.log('DbPopulator executed')
				done()
			})

		})

		it('By field', function(done) {


			dao.queryAsCursor('restfulMongo', 'saluti', {}, {}, {
				batchSize: 100
			}, function(err, cursor) {
				var lengthOfCursor = 0;

				cursor.each(function(err, item) {
					if(item == null) {
						console.log('ola', lengthOfCursor);
						expect(lengthOfCursor).to.be.eql(number)
						expect(err).to.be.eql(null)
						done()
					} else {
						lengthOfCursor++
					}

				})

			})
		})
	})

	describe('DAO remove', function() {
		var dataForRemove;
		beforeEach(function(done) {
			dataForRemove = {
				saluti: [{
					saluto: 'ciao',
				}, {
					saluto: 'ciao',
				}, {
					saluto: 'ola'
				}]
			}
			new DbPopulator({
				databaseName: 'restfulMongo',
				data: dataForRemove,
				user: 'rest',
				password: 'ful'
			}).execute().then(function() {
				console.log('DbPopulator executed')
				done()
			})
		})

		it('Test remove more than one element', function(done) {
			dao.remove('restfulMongo', 'saluti', {
				saluto: 'ciao'
			}, {}, function(err, numberOfRemoved) {
				expect(err).to.be.eql(null)
				expect(numberOfRemoved).to.be.eql(2)

				dao.query('restfulMongo', 'saluti', {}, {}, {}, function(err, docs) {
					expect(docs.length).to.be.eql(1)
					done()
				})
			})
		})

	})

})