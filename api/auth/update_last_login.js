const connection = require('../connection.js');

function update_last_login(account_id) {
    connection.query(
        'UPDATE last_login_details SET date = NOW() WHERE id_user = ?', 
        [ account_id ],
        (error, results) => {
            if (error) throw error;
        });
}

module.exports = update_last_login;