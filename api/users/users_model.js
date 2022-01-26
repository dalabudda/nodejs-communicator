const connection = require('../connection.js');

let users = {};

users.search = (search_login, account_id, callback) => {
    connection.query(
        'SELECT id, login, avatar_url FROM users WHERE login LIKE ? AND id != ?', 
        [ '%' + search_login + '%', account_id ], 
        (error, results) => {
            if (error) throw error;
            callback(results);
        });
};

function select_contact(contact_id, account_id, callback) {
    connection.query(
        'SELECT id_owner, id_user FROM contacts WHERE id_owner = ? AND id_user = ?', 
        [ account_id, contact_id ], 
        (error, results) => {
            if (error) throw error;
            callback(results[0]);
        });
}

function insert_contact(contact_id, account_id, callback) {
    connection.query(
        'INSERT INTO contacts(id_owner, id_user) VALUES (?, ?)', 
        [ account_id, contact_id ], 
        (error, results) => {
            if (error) throw error;
            callback();
        });
}

users.addcontact = (contact_id, account_id, callback) => {
    select_contact(contact_id, account_id, contact => {
        if (contact) {
            callback(400, { error: "You already added this contact" });
        } else {
            insert_contact(contact_id, account_id, () => {
                callback(200, { id: contact_id });
            });
        }
    });
};

function delete_contact(contact_id, account_id, callback) {
    connection.query(
        'DELETE FROM contacts WHERE id_owner = ? AND id_user = ?', 
        [ account_id, contact_id ], 
        (error, results) => {
            if (error) throw error;
            callback();
        });
}

users.deletecontact = (contact_id, account_id, callback) => {
    select_contact(contact_id, account_id, contact => {
        if (contact) {
            delete_contact(contact_id, account_id, () => {
                callback(200, { id: contact_id });
            });
        } else {
            callback(400, { error: "You don't have this contact" });
        }
    });
};

module.exports = users;