const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 8080;

const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

app.use(session({
  secret: process.env.SECRET,
  // cookie: { maxAge: 300000 }, 
  resave: true,
  saveUninitialized: true,
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');
// const { res } = require('express');

// listen to a port and start web server
const server = app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server listening on ${port}!`);
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/login.html`, 'utf-8');
});

app.get('/files', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(`${__dirname}/public/files.html`, 'utf-8');
  } else {
    res.send('Please make sure that you are logged in');
  }
  // res.end();
});

app.get('/mysql', (req, res) => {
  con.connect((err) => {
    if (err) throw err;
    const sql = con.format('SHOW STATUS;');
    console.log(sql);
    console.log(con.query(sql));
  });
});

app.post('/auth', (req, res) => {
  // console.log("req: " + req);
  // console.log("body: " + req.body);
  // console.log("username: " + req.body.username);
  // console.log("password: " + req.body.password);
  const { username } = req.body;
  const { password } = req.body;
  if (username && password) {
    con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
      console.log('[ERROR]: ' + error);
      console.log('[RESULTS]: ' + results);
      console.log('[FIELDS]: ' + fields);
      if (results.length > 0) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/files');
      } else {
        console.log(res.send('Incorrect Username and/or Password!'));
      }
      res.end();
    });
  } else {
    console.log(res.send('Please enter correct Username and/or Password!'));
    console.log(res.end());
  }
});
