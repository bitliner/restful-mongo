module.exports.remove = function(req, res) {
    var spec = {
        '_id': new BSON.ObjectID(req.params.id)
    };

    ConnectionPool.getDb(self.options, function(err, db) {
        if (!err) {
            db.collection(req.params.collection, function(err, collection) {
                collection.remove(spec, function(err, docs) {
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}');
                });
            });
        }
    })

}