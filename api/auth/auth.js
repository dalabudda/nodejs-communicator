let update_last_login = require('./update_last_login.js');

function auth(req, res, next) {
    const sess = req.session.account;
    if (sess && sess.id) {
        update_last_login(sess.id);
        next();
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
}

module.exports = auth;