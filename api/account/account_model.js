const bcrypt = require('bcrypt');
const connection = require('../connection.js');

let account = {};

function updateLoginDetails(account_id, callback) {
    connection.query(
        'UPDATE last_login_details SET status = "Online", date = NOW() WHERE id_user = ?', 
        [ account_id ],
        (error, results) => {
            if (error) throw error;
            callback();
        });
}

account.login = (login, pass, callback) => {
    connection.query(
        'SELECT id, login, pass_hash, avatar_url FROM users WHERE login = ?', 
        [ login ], 
        (error, results) => {
            if (error) throw error;
            let user = results[0];
            if (user) {
                bcrypt.compare(pass, user.pass_hash, function(err, result) {
                    if (result) {
                        user.pass_hash = undefined;
                        updateLoginDetails(user.id, () => {
                            callback(200, user);
                        });
                    } else {
                        callback(400, { error: "Wrong login or password" });
                    }
                });
            } else {
                callback(404, { error: "Wrong login" });
            }
        });
};

function insertLoginDetails(account_id, callback) {
    connection.query(
        'INSERT INTO last_login_details(id_user, status) VALUES(?, "Online")', 
        [ account_id ],
        (error, results) => {
            if (error) throw error;
            callback();
        });
}

function insertRegistered(login, pass, callback) {
    connection.query(
        'INSERT INTO users(login, pass_hash) VALUES(?, ?)', 
        [ login, pass ],
        (error, results) => {
            if (error) throw error;
            let user = {
                id: results.insertId,
                login: login,
                avatar_url: ""
            };
            insertLoginDetails(user.id, () => {
                callback(200, user);
            });
        });
}

account.register = (login, pass, callback) => {
    connection.query(
        'SELECT login FROM users WHERE login = ?', 
        [ login ], 
        (error, results) => {
            if (error) throw error;
            if (results[0]) {
                callback(400, { error: "Login already taken" });
            } else {
                bcrypt.hash(pass, 10, function(err, hash) {
                    insertRegistered(login, hash, callback);
                });
            } 
        });
};

account.get = (account_id, callback) => {
    connection.query(
        'SELECT id, login, avatar_url FROM users WHERE id = ?', 
        [ account_id ], 
        (error, results) => {
            if (error) throw error;
            callback(results[0]);
        });
};

account.logout = (account_id) => {
    connection.query(
        'UPDATE last_login_details SET status = "Offline" WHERE id_user = ?', 
        [ account_id ],
        (error, results) => {
            if (error) throw error;
        });
}

account.changeAvatar = (account_id, avatar_url, callback) => {
    connection.query(
        'UPDATE users SET avatar_url = ? WHERE id = ?', 
        [ avatar_url, account_id ], 
        (error, results) => {
            if (error) throw error;
            callback({ id: account_id });
        });
};

account.setStatus = (account_id, status, callback) => {
    connection.query(
        'UPDATE last_login_details SET status = ?, date = NOW() WHERE id_user = ?', 
        [ status, account_id ], 
        (error, results) => {
            if (error) throw error;
            callback({ id: account_id });
        });
};

module.exports = account;