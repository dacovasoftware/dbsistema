const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbsistema'
});

db.connect((error) => {
  if (error) {
    console.log('Error al conectar MySQL:', error);
  } else {
    console.log('Conectado a MySQL');
  }
});

module.exports = db;