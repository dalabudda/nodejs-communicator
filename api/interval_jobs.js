const connection = require('./connection.js');

function updateStatuses() {
    connection.query(
        'UPDATE last_login_details SET status = "Offline" WHERE date < (NOW() - INTERVAL 1 MINUTE)', 
        (error, results) => {
            if (error) throw error;
        });
}

function one_minute_jobs() {
    updateStatuses();
}

function interval_jobs() {
    setInterval(one_minute_jobs, 60000);
};

module.exports = interval_jobs;