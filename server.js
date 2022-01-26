const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config.json');
const router = require('./api/routes.js')
const interval_jobs = require('./api/interval_jobs.js');

express()
	.use(cors())
	.use(express.json())
	.use(session({
		secret: 'ssshhhhh', 
		saveUninitialized: false, 
		resave: false, 
		cookie: { secure: false }
	}))
	.use('/', express.static(__dirname + '/public_html'))
	.use('/api', router)
	.listen(config.listenerPort);

interval_jobs();