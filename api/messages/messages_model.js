const connection = require('../connection.js');

let messages = {};

function setSeen(user_id, account_id, callback) {
    connection.query(
        'UPDATE comments SET seen = 1 WHERE ((id_sender = ? AND id_receiver = ?) OR (id_sender = ? AND id_receiver = ?)) AND seen = 0', 
        [ user_id, account_id, account_id, user_id ], 
        (error, results) => {
            if (error) throw error;
            callback();
        });
}

messages.user = (user_id, account_id, callback) => {
    setSeen(user_id, account_id, () => {
        connection.query(
            'SELECT id, id_sender, text, date, seen FROM comments WHERE (id_sender = ? AND id_receiver = ?) OR (id_sender = ? AND id_receiver = ?) ORDER BY date, id', 
            [ user_id, account_id, account_id, user_id ], 
            (error, results) => {
                if (error) throw error;
                callback(results);
            });
        });
};

function updateSelectedUser(selected_user, comment_id, account_id, callback) {
    connection.query(
        'SELECT id, id_sender, text, date, seen FROM comments WHERE id_sender = ? AND id_receiver = ? AND id > ? AND seen = 0 ORDER BY date, id', 
        [ selected_user, account_id, comment_id ], 
        (error, results) => {
            if (error) throw error;
            callback(results);
        });
}

messages.update = (selected_user, comment_id, account_id, callback) => {
    connection.query(`
        SELECT u.id, u.login, u.avatar_url, l.status, m.text, c.id_user as contact
        FROM users u
        LEFT JOIN contacts c ON (c.id_user = u.id AND c.id_owner = ?)
        LEFT JOIN last_login_details l ON l.id_user = u.id
        LEFT JOIN (
            SELECT MAX(m2.id) as comment_id, m2.id_sender 
            FROM comments m2 
            WHERE m2.id_receiver = ?
            AND m2.seen = 0
            GROUP BY m2.id_sender
            ) m3 ON m3.id_sender = u.id
        LEFT JOIN comments m ON m.id = m3.comment_id
        WHERE (c.id_user IS NOT NULL OR m.text IS NOT NULL)
        ORDER BY m.id
        `, 
        [ account_id, account_id ], 
        (error, results) => {
            if (error) throw error;
            updateSelectedUser(selected_user, comment_id, account_id, results2 => {
                const object = {
                    users: results,
                    selectedUserMessages: results2
                };
                callback(object);
            });
        });
};

messages.send = (account_id, id_receiver, text, callback) => {
    setSeen(id_receiver, account_id, () => {
        connection.query(
            'INSERT INTO comments(id_sender, id_receiver, text) VALUES (?, ?, ?)',
            [ account_id, id_receiver, text ], 
            (error, results) => {
                if (error) throw error;
                callback({ id: results.insertId });
            });
        });
};

module.exports = messages;