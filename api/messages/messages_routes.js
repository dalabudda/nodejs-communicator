const express = require('express');
const messages = require('./messages_model.js');
const router = express.Router();

router.get('/user/:user_id', (req, res) => {
    const account_id = req.session.account.id;
    messages.user(req.params.user_id, account_id, (results) => {
        res.status(200).json(results);
    });
});

router.post('/update', (req, res) => {
    const account_id = req.session.account.id;
    messages.update(req.body.selected_user, req.body.comment_id, account_id, (results) => {
        res.status(200).json(results);
    });
});

router.post('/send', (req, res) => {
    const account_id = req.session.account.id;

    const id_receiver = req.body.id_receiver;
    if (!id_receiver) {
        res.status(400).json({ error: "No receiver selected" });
        return;
    }

    const text = req.body.text;
    if (!text) {
        res.status(400).json({ error: "No text sended" });
        return;
    }

    messages.send(account_id, id_receiver, text, (result) => {
        res.status(200).json(result);
    });
});

module.exports = router;