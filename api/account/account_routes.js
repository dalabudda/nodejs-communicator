const express = require('express');
const auth = require('../auth/auth.js');
const account = require('./account_model.js');
const router = express.Router();

router.post('/login', (req, res) => {
    const login = req.body.login;
    if (!login) {
        res.status(400).json({ error: "Login needed" });
        return;
    }
        
    const pass = req.body.password;
    if (!pass) {
        res.status(400).json({ error: "Password needed" });
        return;
    }

    account.login(login, pass, (status, result) => {
        if (status == 200) {
            req.session.account = { id: result.id };
        }
        res.status(status).json(result);
    });
});

router.post('/register', (req, res) => {
    const login = req.body.login;
    if (!login) {
        res.status(400).json({ error: "Login needed" });
        return;
    }
        
    const pass = req.body.password;
    if (!pass) {
        res.status(400).json({ error: "Password needed" });
        return;
    }

    account.register(login, pass, (status, result) => {
        if (status == 200) {
            req.session.account = { id: result.id };
        }
        res.status(status).json(result);
    })
});

//Logged users only
router.use(auth);

router.get('/', (req, res) => {
    const account_id = req.session.account.id;
    account.get(account_id, (result) => {
        res.status(200).json(result);
    });
});

router.get('/logout', (req, res) => {
    const account_id = req.session.account.id;
    req.session.account = {};
    account.logout(account_id);
    res.status(200).send({ id: account_id });
});

router.post('/changeavatar', (req, res) => {
    const account_id = req.session.account.id;
    account.changeAvatar(account_id, req.body.avatar_url, (result) => {
        res.status(200).json(result);
    });
});

router.post('/setstatus', (req, res) => {
    const account_id = req.session.account.id;
    account.setStatus(account_id, req.body.status, (result) => {
        res.status(200).json(result);
    });
});

module.exports = router;