const mysql = require('mysql2/promise'); 

//SQL DB
const pool = mysql.createPool({
  host: 'localhost', 
  user: 'root', 
  password: 'Zhong@sql', 
  database: 'urlshortener_db', 
  waitForConnections: true, 
  connectionLimit: 10, 
  queueLimit: 0
}); 

pool.getConnection()
  .then(connection => {
    console.log('Connect to database'); 
    connection.release(); 
  })
  .catch(err => {
    console.error('Failed to connect to db: ', err.message); 
  }); 

module.exports = pool;
