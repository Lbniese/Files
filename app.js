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

// 'multer' is a middleware for handling multipart/form-data, which we use for file uploads
const multer = require('multer');

// initiate expresss
const app = express();
// defining port to be environment variable PORT or else 8080
const port = process.env.PORT || 8080;

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

// using session middleware
app.use(session({
  // secret is used to sign the session ID cookie - DEPRECATED
  secret: process.env.SECRET,
  // cookie.maxAge specifies the number to use when calculating the Expires Set-Cookie Attribute
  // cookie: { maxAge: 300000 },
  // resave forces the session to be saved back to the session store
  resave: true,
  // saveUnitialized forces the session that is unitialized to be saved in the session store as well
  saveUninitialized: true,
}));

// defining location where static files should be served from
app.use(express.static('public'));
// using middleware that parses json and looks only at requests
app.use(express.json());
// using middleware that parses urlencoded bodies and looks at requests
app.use(express.urlencoded({ extended: true }));

// The 'fs' module enables interacting with the file system
const fs = require('fs');
const { send } = require('process');
// const { res } = require('express');

// listen to a port and start web server
const server = app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server listening on ${port}!`);
  }
});

const header = fs.readFileSync(`${__dirname}/public/header.html`, 'utf-8');
const footer = fs.readFileSync(`${__dirname}/public/footer.html`, 'utf-8');
const loginpage = fs.readFileSync(`${__dirname}/public/login.html`, 'utf-8');
const filespage = fs.readFileSync(`${__dirname}/public/files.html`, 'utf-8');

// get call that serves login.html
app.get('/', (req, res) => {
  res.send(header + loginpage + footer);
});

// get call that serves files.html if the session states that the user is logged in
app.get('/files', (req, res) => {
  if (req.session.loggedin) {
    res.send(header + filespage + footer);
  } else {
    res.send('Please make sure that you are logged in');
  }
  // res.end();
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
        console.log(`[ERROR]: ${error}`);
        console.log(`[RESULTS]: ${results}`);
        console.log(`[FIELDS]: ${fields}`);
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

// File Management - Start
/* Multer:
Multer is a node.js middleware for handling multipart/form-data,
which is primarily used for uploading files.
It is written on top of busboy for maximum efficiency.
*/
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './storage');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({
  // dest: 'storage/' // this saves your file into a directory called "storage"
  storage,
});

app.get('/download/:file(*)', (req, res) => {
  const { file } = req.params;
  const downloadFilePath = `${path.resolve('.')}/storage/${file}`;

  res.download(downloadFilePath, file, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Downloading successfully!');
    }
  });
});

app.get('/delete/:file(*)', (req, res) => {
  console.log('Delete call was made in backend');
  const { file } = req.params;
  const deleteFilePath = `${path.resolve('.')}/storage/${file}`;

  console.log(`deleting: ${deleteFilePath}`);
  fs.unlink(deleteFilePath, () => {
    console.log(`File deleted: ${deleteFilePath}`);
    /*
    res.send({
      status: '200',
      responseType: 'string',
      response: 'success',
    });
    */
    res.end();
    res.redirect('/files');
  });
});

app.post('/files', upload.single('file-to-upload'), (req, res) => {
  console.log('redirect to /files');
  res.redirect('/files');
});

app.get('/getfiles', (req, res) => {
  const dir = './storage';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const storageArray = fs.readdirSync(dir);

  const storageObjectArray = [];

  const getDateFormat = (date) => {
    if (date != null) {
      return `${new Intl.DateTimeFormat('en', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).format(date)}`;
    }
  };

  // credits: https://stackoverflow.com/a/18650828
  function getFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  storageArray.forEach((directoryFile) => {
    const storageObject = {
      name: directoryFile, size: '', added: '', lastModified: '', created: '',
    };

    console.log(`directory file:${directoryFile}`);

    const fileSizeInBytes = fs.statSync(`storage/${directoryFile}`).size;

    const fileAdded = fs.statSync(`storage/${directoryFile}`).atime;

    const fileLastModified = fs.statSync(`storage/${directoryFile}`).mtime;

    const fileCreated = fs.statSync(`storage/${directoryFile}`).ctime;

    storageObject.added = getDateFormat(fileAdded);

    storageObject.lastModified = getDateFormat(fileLastModified);

    storageObject.created = getDateFormat(fileCreated);

    storageObject.size = getFileSize(fileSizeInBytes);

    storageObjectArray.push(storageObject);
  });
  res.send(storageObjectArray);
});

// File Management - End
