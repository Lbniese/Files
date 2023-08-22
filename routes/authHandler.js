const router = require('express').Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 11;

// Using a connection pool can help with better performance, handling multiple connections.

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT || 5432, // Default PostgreSQL port
  ssl: { rejectUnauthorized: false }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.end();
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    pool.query('INSERT INTO accounts (username, password) VALUES ($1, $2)', [username, hash], (error, results) => {
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

  pool.query('SELECT * FROM accounts WHERE username = $1', [username], async (error, results) => {
    if (error) {
      console.log(error);
      return res.end();
    }

    try {
      if (results.rows.length > 0) {
        const user = results.rows[0];
        
        if (user && await bcrypt.compare(password, user.password)) {
          req.session.loggedin = true;
          req.session.username = username;
          return res.redirect('/files');
        } else {
          console.log('Incorrect Username and/or Password!');
          res.send('Please enter correct Username and/or Password!').end();
        }
      } else {
        console.log('Incorrect Username and/or Password!');
        res.send('Please enter correct Username and/or Password!').end();
      }
    } catch (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).send('Server error');
    }
  });
});

module.exports = {
  router,
};