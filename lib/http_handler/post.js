var Dao = require('../dao');

function HandlerHttpPost = function (dao) {
    this.dao = dao;
}

HandlerHttPost.prototype.post = function(req, res) {
    this.dao.save(req.params.db, req.params.collection, req.body, function(err, doc) {
        if (err) {
            return res.json(500, err)
        }
        res.json(200, doc)
    })
};

module.exports = HandlerHttpPost;
