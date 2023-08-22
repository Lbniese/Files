const router = require('express').Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 11;

// Using a connection pool can help with better performance, handling multiple connections.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.end();
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    pool.query('INSERT INTO accounts (username, password) VALUES (?, ?)', [username, hash], (error, results) => {
      if (error) {
        console.log(error);
        res.send('Username is already taken');
      } else {
        res.redirect('/');
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

router.post('/auth', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.end();
  }

  pool.query('SELECT * FROM accounts WHERE username = ?', [username], async (error, rows) => {
    if (error) {
      console.log(error);
      return res.end();
    }

    if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
      req.session.loggedin = true;
      req.session.username = username;
      return res.redirect('/files');
    }

    console.log('Incorrect Username and/or Password!');
    res.send('Please enter correct Username and/or Password!').end();
  });
});

module.exports = {
  router,
};