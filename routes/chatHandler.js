/* Start Router Code part that can't be in a router??? - Start */
const router = require('express').Router();

const http = require('http');

const socketServer = http.createServer(router);
const { Server } = require('socket.io');

const io = new Server(socketServer);

socketServer.listen(8081, () => {
  console.log('Sockets listening on port 8081!');
});

// const io = require('socket.io')(socketServer);

io.on('connection', (socket) => {
  console.log('New user connected');

  // default username
  socket.username = 'Anonymous';

  // listen on change_username
  socket.on('change_username', (data) => {
    socket.username = data.username;
  });

  // listen on new_message
  socket.on('new_message', (data) => {
    // broadcast the new message
    io.sockets.emit('new_message', { message: data.message, username: socket.username });
  });

  // listen on typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { username: socket.username });
  });
});

module.exports = {
  router,
};

/* Start Router Code part that can't be in a router??? - END */
