var express = require('express');

var app = express();

app.use(express.static('build'))

const PORT = process.env.PORT || 3001

app.listen(PORT, function () {
  console.log('Server running on port'+PORT);
});