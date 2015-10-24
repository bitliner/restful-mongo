RESTful MongoDB
============================

Get an HTTP API server in a matter of minutes.


# Install and setup an express server using restful-mongo

* `npm install -g express-generator`
* `express mongo-express` 
* `cd mongo-express && npm install`
* `npm install --save restful-mongo` to install *restful-mongo*
* add to *app.js* file, in the section where routes are configured, the following code

```
var RestfulMongo=require('restful-mongo');
new RestfulMongo({
    HOST:'localhost',   // host of mongodb server, OPTIONAL
    PORT:27017          // port of mongodb server, OPTIONAL  
}).configure(app);
```

* `npm start`
* access browser at `http://localhost:3000/api/test/collectionName` to read JSON documents of collection  *collectionName* of database *test1*



# Example of HTTP requests

**You can do following requests**:	


 > ```
 > GET /api/localhost:27017/test1/collections HTTP/1.1
 > ```
 >
 > <big>Get list of collection names of *test1* database </big>

<br>

 >```
 >GET /api/localhost:27017/test1/books HTTP/1.1
 >```
 >
 ><big>Get all documents of collection *books* of *test1* database </big>

<br>

 >```
 >GET /api/localhost:27017/test1/books?rawQuery={author:{$in:['Manzoni']}} HTTP/1.1
 >```
 >
 ><big>Get all documents of collection *books* of *test1* database whose author is *Manzoni*</big>


# Disclaimer

* the code behind this module is very old, not so readable, and needs refactoring. Do not consider this code as code that I usually write.

# Contribute

## Test

### Requirements

* a MongoDB instance

### How to run test

`npm test`


