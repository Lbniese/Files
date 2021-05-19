const router = require('express').Router();

// import 'mysql' module which is a driver for node js
const mysql = require('mysql');

// defining mysql connection details for when we want to connect to the database
// const con = mysql.createConnection({
const con = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

router.post('/register', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;

  if (username && password) {
    con.query('INSERT INTO accounts (username, password) VALUES (?, ?)', [username, password], (error, results, fields) => {
      if (error) {
        console.log(error);
        res.send('Username is already taken');
      } else {
        if (results.length > 0) {
          res.redirect('/');
        } else {
          // console.log(res.send(`Looks like an error occured: ${error}`));
          res.redirect('/');
        }
        res.end();
      }
    });
    // console.log(res.end());
    // res.redirect('/');
  } else {
    console.log(res.end());
  }
});

// post call to handle authentication
router.post('/auth', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  if (username && password) {
    con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(`[ERROR]: ${error}`);
        // console.log(`[RESULTS]: ${results}`);
        // console.log(`[FIELDS]: ${fields}`);
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          res.redirect('/files');
        } else {
          console.log(res.send('Incorrect Username and/or Password!'));
        }
        res.end();
      }
    });
  } else {
    console.log(res.send('Please enter correct Username and/or Password!'));
    console.log(res.end());
  }
});

module.exports = {
  router,
};
