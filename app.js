// import 'path' module which provides utilities for woking with file and directory paths
const path = require('path');
// import 'dotenv' module that loads environment variables form a .env file into process.env
const dotenv = require('dotenv');

// load .env file contents into process.env from the root paths
dotenv.config({ path: path.resolve(__dirname, '.env') });

// import 'express' module which is a web framework for node
const express = require('express');
// import 'express-session' module which is a session middleware
const session = require('express-session');

// import 'multer' which is a middleware for handling multipart/form-data, which we use for uploading filess
const multer = require('multer');

// initiate expresss
const app = express();
// defining port to be environment variable PORT or else 8080
const port = process.env.PORT || 8080;

// import 'mysql' module which is a driver for node js
const mysql = require('mysql');

// defining mysql connection details for when we want to connect to the database
const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

// using session middleware
app.use(session({
  // secret is used to sign the session ID cookie
  secret: process.env.SECRET,
  // cookie.maxAge specifies the number to use when calculating the Expires Set-Cookie Attribute.
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


// File Management - Start
/* Multer:
Multer is a node.js middleware for handling multipart/form-data,
which is primarily used for uploading files.
It is written on top of busboy for maximum efficiency.
*/

//Upload Handler
const uploadHandler = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, `${req.query.path}`); },
  filename: function (req, file, cb) { cb(null, file.originalname); }
});

const upload = multer({
  storage: uploadHandler
});

app.post('/', upload.any(), (req, res) => {
  res.status(200).send(),
  console.log(req.files);
  console.log('Uploading File!');
});

app.get('/filelist', (req, res) => {
  let root;
  let response = [];

  if (req.query.path) {
    root = `$(req.query.path})`;
  }

});

// File Management - End