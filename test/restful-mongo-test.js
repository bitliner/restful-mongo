// i should
// - populate db with example data
// - test each http method
// --- GET
// --- GET -> get
// --- GET -> query
// --- GET -> count
// --- GET -> distinct+query
// --- POST
// --- PUT
// --- DELETE

var request = require('request'),
    expect = require('chai').expect,
    DbPopulator = require('./db-populator.js'),
    path = require('path'),
    RestfulMongo = require('../');

var request = require('supertest'),
    express = require('express');

var app = express();
var MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/test';
var async = require('async');




describe('RestfulMongo - Http API', function() {





    beforeEach(function(done) {
        var p1, p2;
        new RestfulMongo({
            // HOST: 'localhost',
            // PORT: 27017
        }).configure(app);

        function mydone() {
            if (p1 && p2) {
                done();
            }
        }
        new DbPopulator({
            databaseName: 'test1',
            data: {
                saluti: [{
                    saluto: 'ciao',
                }, {
                    saluto: 'ola'
                }]
            }
        }).execute().then(function() {
            p1 = true;
            mydone();
        });
        new DbPopulator({
            databaseName: 'test2',
            data: {
                saluti: [{
                    saluto: 'ciao',
                }, {
                    saluto: 'ola'
                }]
            }
        }).execute().then(function() {
            p2 = true;
            mydone();
        });
    });

    it('GET / should respond with the whole list of objects', function(done) {
        request(app)
            .get('/api/localhost:27017/test1/saluti')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                // console.log('res', res.body);
                expect(res.body.length).to.be.eql(2);
                expect(res.body[1].saluto).to.be.eql('ola');
                expect(res.body[0].saluto).to.be.eql('ciao');
                done();
            });
    });
    it('GET /api/collections should respond with the whole list of collections', function(done) {
        request(app)
            .get('/api/localhost:27017/test1/collections')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                // console.log('res', res.body);
                expect(res.body.length).to.be.eql(2);
                done();
            });
    });
    it('GET /?rawQuery should respond with the list of objects that satisfy the query', function(done) {
        var search;

        search = {
            saluto: 'ciao'
        }
        search = JSON.stringify(search);
        search = encodeURIComponent(search);
        search = 'rawQuery=' + search;
        request(app)
            .get('/api/localhost:27017/test1/saluti?' + search)
        // .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;
                // console.log('res', res.body);
                expect(res.body.length).to.be.eql(1);
                expect(res.body[0].saluto).to.be.eql('ciao');
                done();
            });
    });
    it('GET /?rawOptions.sort should respond with the list of objects ordered according to query string', function(done) {

        async.parallel([

            function(cb) {

                var search;

                search = {
                    sort: {
                        saluto: 1
                    }
                }
                search = JSON.stringify(search);
                search = encodeURIComponent(search);
                search = 'rawOptions=' + search;

                request(app)
                    .get('/api/localhost:27017/test1/saluti?' + search)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        // console.log('res', res.body);
                        expect(res.body.length).to.be.eql(2);
                        expect(res.body[0].saluto).to.be.eql('ciao');
                        expect(res.body[1].saluto).to.be.eql('ola');
                        cb();
                    });

            },
            function(cb) {
                var search;

                search = {
                    sort: {
                        saluto: -1
                    }
                }
                search = JSON.stringify(search);
                search = encodeURIComponent(search);
                search = 'rawOptions=' + search;

                request(app)
                    .get('/api/localhost:27017/test1/saluti?' + search)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        // console.log('res', res.body);
                        expect(res.body.length).to.be.eql(2);
                        expect(res.body[0].saluto).to.be.eql('ola');
                        expect(res.body[1].saluto).to.be.eql('ciao');
                        cb();
                    });
            }
        ], function(err) {
            done();
        });

    });



})