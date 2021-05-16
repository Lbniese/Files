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

// import 'multer' which is a middleware for handling multipart/form-data, which we use for uploading files
const multer = require('multer');

// initiate expresss
const app = express();
// defining port to be environment variable PORT or else 8080
const port = process.env.PORT || 8080;

// import 'mysql' module which is a driver for node js
const mysql = require('mysql');

// defining mysql connection details for when we want to connect to the database
//const con = mysql.createConnection({
const con = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

// using session middleware
app.use(session({
  // secret is used to sign the session ID cookie - DEPRECATED
  secret: process.env.SECRET,
  // cookie.maxAge specifies the number to use when calculating the Expires Set-Cookie Attribute
  // cookie: { maxAge: 300000 }, 
  // resave forces the session to be saved back to the session store which is where the session data is being saved on the server
  resave: true,
  // saveUnitialized forces the session that is unitialized to be saved in the session store as well
  saveUninitialized: true,
}));

// defining location where static files should be served from
app.use(express.static('public'));
// using middleware that parses json and looks only at requests where the Content-Type header matches the type option
app.use(express.json());
// using middleware that parses urlencoded bodies and looks at requests where Content-Type header matches the type option
app.use(express.urlencoded({ extended: true }));

// The 'fs' module enables interacting with the file system
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

// get call that serves login.html
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/login.html`, 'utf-8');
});

// get call that serves files.html if the session states that the user is logged in
app.get('/files', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(`${__dirname}/public/files.html`, 'utf-8');
  } else {
    res.send('Please make sure that you are logged in');
  }
  // res.end();
});

// get call to test mysql connection details and status
app.get('/mysql', (req, res) => {
  con.connect((err) => {
    if (err) throw err;
    const sql = con.format('SHOW STATUS;');
    console.log(sql);
    console.log(con.query(sql));
  });
});

// post call to handle authentication
app.post('/auth', (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  if (username && password) {
    con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
      if (error) {
        console.log(error);
      } else {
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
    }});
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
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './storage');
  },
  filename: function (req, file, callback) {
      callback(null, file.originalname);
  }
});

const upload = multer({
  //dest: 'storage/' // this saves your file into a directory called "storage"
  storage: storage 
}); 

app.post('/files', upload.single('file-to-upload'), (req, res) => {
  console.log('redirect to /files')
  res.redirect('/files');
});

app.get('/getfiles', (req, res) => {
  const storageArray = fs.readdirSync('storage');

  let storageObjectArray = [];

  storageArray.forEach(directoryFile =>  {
    let storageObject = {name: directoryFile, size: '', lastModified: ''};

    console.log('directory file:' + directoryFile);

    const fileSizeInBytes = fs.statSync('storage/'+directoryFile).size;

    const fileLastModified = fs.statSync('storage/'+directoryFile).mtime;

    storageObject.lastModified = getDateFormat(fileLastModified);

    storageObject.size = getFileSize(fileSizeInBytes);
    storageObjectArray.push(storageObject);
  });
  res.send(storageObjectArray);
});

const getDateFormat = (date) => {
  if (date != null) {
    return new Intl.DateTimeFormat('default').format(date) + '';
  }
};

const getFileSize = (bytes) => {
  if (bytes <= 1024) { return (`${bytes} Byte`); }
  else if (bytes > 1024 && bytes <= 1048576) { return ((bytes / 1024).toPrecision(3) + ' KB'); }
  else if (bytes > 1048576 && bytes <= 1073741824) { return ((bytes / 1048576).toPrecision(3) + ' MB'); }
  else if (bytes > 1073741824 && bytes <= 1099511627776) { return ((bytes / 1073741824).toPrecision(3) + ' GB'); }
};

// File Management - End
