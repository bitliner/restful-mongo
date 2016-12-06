DB_NAME=restfulMongo
MONGODB_HOST=192.168.99.100
MONGODB_PORT=27017
DB_URL=mongodb://$(MONGODB_HOST):$(MONGODB_PORT)/$(DB_NAME)

noop:

set_env:
	export MONGODB_HOST=192.168.99.100 && \
	export MONGODB_PORT=27017 && \
	export DB_NAME="restfulMongo" && \
	export DB_URL="mongodb://$MONGODB_HOST:$MONGODB_PORT/$DB_NAME"
docker_start_mongo:
	docker run --name "mongo-test" -p 27017:27017 -d mongo
docker_stop_mongo:
	docker stop mongo-test && docker rm mongo-test
test:
	make set_env && \
	make docker_stop_mongo; make docker_start_mongo && \
	cd packages && \
	cd restful-mongo-routes && npm test && cd .. && \
	cd restful-mongo-http-handlers && MONGODB_HOST=$(MONGODB_HOST) MONGODB_PORT=$(MONGODB_PORT) DB_NAME=$(DB_NAME) DB_URL=mongodb://$(MONGODB_HOST):$(MONGODB_PORT)/$(DB_NAME) npm test && cd .. && \
	cd restful-mongo-prodocol-utils && npm test && cd .. && \
	make docker_stop_mongo

