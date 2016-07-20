# restful-mongo-http-handlers

## Test

1. `$ npm run test`
2. The first time you run the test it will fail. That's because the id of the user in the api test does not exist yet.
3. `$ mongo --port 27101`
4. `> use local`
5. `db.users.find()`
6. Select the first user id and replace it in the test spec
7. Run the test again
