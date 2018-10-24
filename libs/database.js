const config = require('config').get('db');
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  connectionLimit: 5,
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.name
});