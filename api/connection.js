const config = require('../config.json');
const connection = require('mysql').createConnection(config.connection);

connection.connect();

module.exports = connection;