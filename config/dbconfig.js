const mysql = require("mysql")

var options = {
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}

const con = mysql.createConnection(options)

module.exports = { con, options }
