module.exports.insert = function(req, res) {
    self.Dao.save(req.params.host, req.params.db, req.params.collection, req.body, function(err, doc) {
        if (err) {
            return res.json(500, err)
        }
        res.json(200, doc)
    })
}