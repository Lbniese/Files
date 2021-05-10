const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env')});

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

// listen to a port and start web server
const server = app.listen(port, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Server listening on ${port}!`);
    }
  });

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`, 'utf-8');
});

app.get('/mysql', (req, res) => {
  connection.connect(function(err) {
    if (err) throw err;
    const sql = connection.format('SHOW STATUS;');
    console.log(sql);
    console.log(connection.query(sql));
  });
})