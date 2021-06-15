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

// defining port to be environment variable PORT or else 8080
const port = process.env.PORT || 8080;

// using session middleware
app.use(session({
  // secret is used to sign the session ID cookie - DEPRECATED
  secret: process.env.SECRET,
  // maxAge - session lasts for 15min
  maxAge: 900000,
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

// returns http server object with the requestListener being express
// the requestListener is being executed every time the server gets a request
const server = require('http').createServer(app);

// import socket.io and connect it to the http server 'server'
const io = require('socket.io')(server);

// import auth handler router
const authHandlerRouter = require('./routes/authHandler.js');
// import file handler router
const fileHandlerRouter = require('./routes/fileHandler.js');
// import ratelimit handler router
const rateLimitHandlerRouter = require('./routes/rateLimitHandler.js');

// use the imported routes
app.use(authHandlerRouter.router);
app.use(fileHandlerRouter.router);
app.use(rateLimitHandlerRouter.defaultLimiter);

// listen to a port and start web server
server.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server listening on ${port}!`);
  }
});

// define locations of the different .html pages
const header = fs.readFileSync(`${__dirname}/public/header.html`, 'utf-8');
const footer = fs.readFileSync(`${__dirname}/public/footer.html`, 'utf-8');
const loginpage = fs.readFileSync(`${__dirname}/public/login.html`, 'utf-8');
const filespage = fs.readFileSync(`${__dirname}/public/files.html`, 'utf-8');
const registerpage = fs.readFileSync(`${__dirname}/public/register.html`, 'utf-8');

// initialize empty user
let user = null;

// get call that serves login.html
app.get('/', (req, res) => {
  res.send(header + loginpage + footer);
});

// get call that serves the register page
app.get('/register', (req, res) => {
  res.send(header + registerpage + footer);
});

// get call that serves files.html if the session states that the user is logged in
app.get('/files', (req, res) => {
  if (req.session.loggedin) {
    user = req.session.username;
    res.send(header + filespage + footer);
  } else {
    res.send('Please make sure that you are logged in');
  }
  // res.end();
});

// SOCKET - START
io.on('connection', (socket) => {
  // set username as the one we logged in with (auth, from mysql db)
  socket.username = user;

  // listen on new_message
  socket.on('new_message', (data) => {
    // broadcast the new message
    io.emit('new_message', { message: data.message, username: socket.username });
  });

  // listen on typing - be able to show username of the one typing
  socket.on('typing', () => {
    socket.broadcast.emit('typing', { username: socket.username });
  });
});
// SOCKET - END
