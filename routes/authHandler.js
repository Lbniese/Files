// import express's Router() - isolated instance of middleware and routes (mini-application)
// - can only perform middwalre and routing functions
const router = require('express').Router();

// import 'mysql' module which is a driver for node js
const mysql = require('mysql');

const bcrypt = require('bcrypt');

// 11 hashes per second
const salt = 11;

// defining mysql connection details for when we want to connect to the database
// const con = mysql.createConnection({
const con = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

// post call handling logic for users looking to register and serving the register.html page
router.post('/register', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;

  // checking if both username and password fields have input data
  if (username && password) {
  // insert data into the database with query
    bcrypt.hash(password, salt, (err, hash) => {
      con.query('INSERT INTO accounts (username, password) VALUES (?, ?)', [username, hash], (error, results, fields) => {
        if (error) {
          console.log(error);
          // we assume the only error that can occur is that username is already in use
          res.send('Username is already taken');
        } else {
        // redirecting to homepage (login page) no matter what if no errors
          if (results.length > 0) {
            res.redirect('/');
          } else {
            res.redirect('/');
          }
          res.end();
        }
      });
    });
  } else {
    console.log(res.end());
  }
});

// post call to handle authentication
router.post('/auth', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  // checking if both username and password fields have input data
  if (username && password) {
    // check if username and pass is in db
    con.query('SELECT * FROM accounts WHERE username = ?', [username], (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else if (rows.length > 0) {
        if (bcrypt.compare(password, rows[0].password)) {
          // if success then set 'loggedin' to true
          req.session.loggedin = true;
          // setting username data as well which is used in the sockets chat
          req.session.username = username;
          res.redirect('/files');
        } else {
          // if no result returned we assume there was an error
          console.log(res.send('Incorrect Username and/or Password!'));
        }
        res.end();
      } else {
        console.log(res.send('Please enter correct Username and/or Password!'));
        console.log(res.end());
      }
    });
  }
});

module.exports = {
  router,
};
