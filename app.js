var express = require('express');

var app = express();

app.use(express.static(__dirname+'/build'))

app.get('/test', function (req, res) {
  res.send('Node in render working!');
});

const PORT = process.env.PORT || 3001

app.listen(PORT, function () {
  console.log('Server running on port'+PORT);
});