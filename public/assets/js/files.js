function chatboxCheck() {
  if ((event.keyCode == 13 && document.getElementById('message').value != 0)) {
    document.getElementById('send_message').click();
  } else {
    return false;
  }
}
