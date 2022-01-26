const express = require('express');
const auth = require('./auth/auth.js');
const account = require('./account/account_routes.js');
const users = require('./users/users_routes.js');
const messages = require('./messages/messages_routes.js');
const router = express.Router();

router.use('/account', account);

//Logged users only
router.use(auth);
router.use('/users', users);
router.use('/messages', messages);

module.exports = router;