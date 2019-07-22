const path = require('path');
const db = require('knex')(
    {
        client: 'sqlite3',
        connection: {
            filename: path.dirname(__dirname) + '/votes.sqlite',
        },
        useNullAsDefault: true,
    }
);

module.exports = db;
