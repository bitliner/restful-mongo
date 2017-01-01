DB_NAME=restfulMongo
MONGODB_HOST=192.168.99.100
MONGODB_PORT=27017
DB_URL=mongodb://$(MONGODB_HOST):$(MONGODB_PORT)/$(DB_NAME)

noop:

set_env:
	export MONGODB_HOST=127.0.0.1 && \
	export MONGODB_PORT=27017 && \
	export DB_NAME="restfulMongo" && \
	export DB_URL="mongodb://$MONGODB_HOST:$MONGODB_PORT/$DB_NAME"
docker_start_mongo:
	docker run --name "mongo-test" -p 27017:27017 -d mongo
docker_stop_mongo:
	docker stop mongo-test && docker rm mongo-test
test:
	echo ">>> Required: Start mongodb instance on localhost:27017/test" && \
	cd packages && \
	cd restful-mongo-routes && npm test && cd .. && \
	cd restful-mongo-protocol-utils && npm test && cd .. && \
	cd restful-mongo-http-handlers && npm test && cd .. && \
	echo ">>> Congratulations, tests terminated successfully!"

