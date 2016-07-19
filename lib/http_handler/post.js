function HandlerHttpPost(dao) {
    this.dao = dao;
}

var _post = function(req, res) {
    this.dao.save(req.params.db, req.params.collection, req.body, function(err, doc) {
        if (err) {
            return res.json(500, err)
        }
        res.json(200, doc)
    })
};

HandlerHttpPost.prototype.service = function () {
    return _post.bind(this);
};

module.exports = HandlerHttpPost;
