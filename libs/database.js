const config = require('config').get('db');
const mysql = require('mysql2/promise');

module.exports = async () => {
  return await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.pass,
    database: config.name
  })
};

