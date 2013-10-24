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
				expect(doc).to.have.property('saluto','ciao')

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
				hint:{
					saluto:1
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
				var lengthOfCursor=0;
				
				cursor.each(function(err,item){
					if (item==null){
						expect(lengthOfCursor).to.be.eql(2)		
						expect(err).to.be.eql(null)
						done()
					}else{
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
				hint:{
					saluto:1
				}
			}, function(err, cursor) {
				var lengthOfCursor=0;
				
				cursor.each(function(err,item){
					if (item==null){
						expect(lengthOfCursor).to.be.eql(2)		
						expect(err).to.be.eql(null)
						done()
					}else{
						lengthOfCursor++
					}

				})
				
			})
		})
	})


})