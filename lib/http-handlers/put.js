module.exports.update = function(req, res) {
    var spec = {
        '_id': new BSON.ObjectID(req.params.id)
    };

    ConnectionPool.getDb(self.options, function(err, db) {
        if (!err) {
            db.collection(req.params.collection, function(err, collection) {
                delete req.body._id
                collection.findAndModify(spec, [], req.body, {
                    new: true,
                    upsert: false
                }, function(err, doc) {
                    if (err) {
                        res.json(500, err)
                    } else {
                        res.json(200, doc)
                    }
                });
            });
        }
    })
}