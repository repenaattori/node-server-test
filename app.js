var express = require('express');

var app = express();

app.use(express.static('client/build'))

app.get('/', function (req, res) {
  res.send('Node in render working!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});