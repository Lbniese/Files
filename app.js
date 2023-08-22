// Modules for core functionality
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const http = require('http');
const io = require('socket.io');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Express
const app = express();

// Configuration
const port = process.env.PORT || 8080;

// Static content loaded once during app startup
const header = fs.readFileSync(`${__dirname}/public/header.html`, 'utf-8');
const footer = fs.readFileSync(`${__dirname}/public/footer.html`, 'utf-8');
const loginpage = fs.readFileSync(`${__dirname}/public/login.html`, 'utf-8');
const filespage = fs.readFileSync(`${__dirname}/public/files.html`, 'utf-8');
const registerpage = fs.readFileSync(`${__dirname}/public/register.html`, 'utf-8');

// Middlewares
app.use(session({
  secret: process.env.SECRET,
  maxAge: 900000,
  resave: true,
  saveUninitialized: true,
}));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
const authHandlerRouter = require('./routes/authHandler.js');
const fileHandlerRouter = require('./routes/fileHandler.js');
const rateLimitHandlerRouter = require('./routes/rateLimitHandler.js');

app.use(authHandlerRouter.router);
app.use(fileHandlerRouter.router);
app.use(rateLimitHandlerRouter.defaultLimiter);

// Routes
app.get('/', (req, res) => res.send(header + loginpage + footer));
app.get('/register', (req, res) => res.send(header + registerpage + footer));
app.get('/files', (req, res) => {
    if (req.session.loggedin) {
        res.send(header + filespage + footer);
    } else {
        res.send('Please make sure that you are logged in');
    }
});

// Socket setup
const server = http.createServer(app);
const socket = io(server);

let user = null;  // Initialize empty user

socket.on('connection', (client) => {
  client.username = user;

  client.on('new_message', (data) => {
    socket.emit('new_message', { message: data.message, username: client.username });
  });

  client.on('typing', () => {
    client.broadcast.emit('typing', { username: client.username });
  });
});

// Start server
server.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server listening on ${port}!`);
  }
});