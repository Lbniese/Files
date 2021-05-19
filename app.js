// import 'path' module which provides utilities for woking with file and directory paths
const path = require('path');
// import 'dotenv' module that loads environment variables form a .env file into process.env
const dotenv = require('dotenv');

// load .env file contents into process.env from the root paths
dotenv.config({ path: path.resolve(__dirname, '.env') });

// import 'express' module which is a web framework for node
const express = require('express');

// initiate expresss
const app = express();

// import 'express-session' module which is a session middleware
const session = require('express-session');

const cors = require('cors');

app.use(cors());

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

// defining port to be environment variable PORT or else 8080
const port = process.env.PORT || 8080;

// using session middleware
app.use(session({
  // secret is used to sign the session ID cookie - DEPRECATED
  secret: process.env.SECRET,
  // cookie.maxAge specifies the number to use when calculating the Expires Set-Cookie Attribute
  // cookie: { maxAge: 300000 },
  // resave forces the session to be saved back to the session store
  resave: false,
  // saveUnitialized forces the session that is unitialized to be saved in the session store as well
  saveUninitialized: false,
}));

// defining location where static files should be served from
app.use(express.static('public'));
// using middleware that parses json and looks only at requests
app.use(express.json());
// using middleware that parses urlencoded bodies and looks at requests
app.use(express.urlencoded({ extended: true }));

// The 'fs' module enables interacting with the file system
const fs = require('fs');
// const { send } = require('process');
// const { res } = require('express');

// hello?
const server = require('http').createServer(app);

const fileHandlerRouter = require('./routes/fileHandler.js');
const authHandlerRouter = require('./routes/authHandler.js');
const chatHandlerRouter = require('./routes/chatHandler.js');

app.use(fileHandlerRouter.router);
app.use(authHandlerRouter.router);
app.use(chatHandlerRouter.router);

// listen to a port and start web server
server.listen(port, (error) => {
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
const registerpage = fs.readFileSync(`${__dirname}/public/register.html`, 'utf-8');

// get call that serves login.html
app.get('/', (req, res) => {
  res.send(header + loginpage + footer);
});

app.get('/register', (req, res) => {
  res.send(header + registerpage + footer);
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
