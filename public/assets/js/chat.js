$(() => {
  const socket = io();

  // buttons and inputs
  const message = $('#message');
  const send_message = $('#send_message');
  const chatroom = $('#chatbox');
  const feedback = $('#feedback');

  // Emit message
  send_message.click(() => {
    socket.emit('new_message', { message: message.val() });
  });

  // Listen on new_message
  socket.on('new_message', (data) => {
    feedback.html('');
    message.val('');
    chatroom.append(`<p class='message'>${data.username}: ${data.message}</p>`);
    chatroom.scrollTop(chatroom[0].scrollHeight);
  });

  // Emit typing
  message.bind('keypress', () => {
    socket.emit('typing');
  });

  // Listen on typing
  socket.on('typing', (data) => {
    feedback.html(`<p><i>${data.username} is typing a message...` + '</i></p>');
  });
});
