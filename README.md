# RESTful MongoDB

Get an HTTP API server in a matter of minutes.

## Requirements

* node.js
* npm
* express

## Usage

**Example with [express.js](http://expressjs.com/)**

```
var express=require('expresss');
var RestfulMongo=require('restful-mongo');

var app=express();

new RestfulMongo({
    HOST:'localhost',   // host of mongodb server, OPTIONAL
    PORT:27017          // port of mongodb server, OPTIONAL  
}).configure(app);
```



### Example of HTTP requests

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


## Disclaimer

* the code behind this module is very old, not so readable, and needs refactoring. Do not consider this code as code that I usually write.

## Contributing

### Test

#### Requirements

* a MongoDB instance running on `localhost` and listening to port `27017`

#### How to run test

`npm test`


