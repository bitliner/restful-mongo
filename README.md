RESTful MongoDB
============================

It allows you to setup an HTTP API server to access data stored on MongoDB, easily and quickly.


# Install and setup an express server using restful-mongo

* `npm install -g express-generator`
* `express mongo-express` 
* `cd mongo-express && npm install`
* `npm install --save restful-mongo` to install
* add to app.js, in the section where routes are configured, the following code

```
var RestfulMongo=require('restful-mongo');
new RestfulMongo({
    HOST:'localhost',
    PORT:27017
}).configure(app);
```

* `npm start`
* access browser at `http://localhost:3000/api/test/collectionName` to read JSON documents of collection  *collectionName* of database *test1*



# Example of HTTP requests

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





