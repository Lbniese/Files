const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

// listen to a port and start web server
const server = app.listen(port, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Server listening on ${port}!`);
    }
  });

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`, 'utf-8');
});