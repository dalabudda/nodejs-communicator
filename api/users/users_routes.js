const express = require('express');
const users = require('./users_model.js');
const router = express.Router();

router.get('/search', (req, res) => {
    const sess = req.session.account;
    const account_id = (sess && sess.id)? sess.id: "";
    users.search(req.query.login, account_id, (results) => {
        res.status(200).json(results);
    });
});

router.post('/addcontact', (req, res) => {
    const sess = req.session.account;
    const account_id = (sess && sess.id)? sess.id: "";
    users.addcontact(req.body.contact_id, account_id, (status, result) => {
        res.status(status).json(result);
    });
});

router.post('/deletecontact', (req, res) => {
    const sess = req.session.account;
    const account_id = (sess && sess.id)? sess.id: "";
    users.deletecontact(req.body.contact_id, account_id, (status, result) => {
        res.status(status).json(result);
    });
});

module.exports = router;