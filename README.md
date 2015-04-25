RESTful MongoDB
============================

It allows to setup HTTP REST API easily and quickly, to access data stored on MongoDB.


# Install and setup an express server using restful-mongo

* install express-generator if you do not have it yet, by running `npm install -g express-generator`
* generate an express app running `express mongo-express` 
* install dependencies `cd mongo-express && npm install`
* install restful-mongo `npm install --save restful-mongo`
* add to app.js, in the section where routes are configured, the following code

```
var RestfulMongo=require('restful-mongo');
new RestfulMongo({
    HOST:'localhost',
    PORT:27017
}).configure(app);
```

* start server running `npm start`
* access browser at `http://localhost:3000/api/test/collectionName` to test the HTTP REST API



# Example of HTTP request

**You can do following requests**:

* 
 > ```
 > GET /api/test1/collections HTTP/1.1
 > ```
 >
 > <big>Get list of collection names of *test1* database </big>

* 
 >```
 >GET /api/test1/books HTTP/1.1
 >```
 >
 ><big>Get all documents of collection *books* of *test1* database </big>


* 
 >```
 >GET /api/test1/books?rawQuery={author:{$in:['Manzoni']}} HTTP/1.1
 >```
 >
 ><big>Get all documents of collection *books* of *test1* database whose author is *Manzoni*</big>





