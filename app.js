var express = require('express');
var app = express();

const mysql = require('mysql2');

const conf = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'demoDb'
}

demo();

async function demo(){
  try{
    const connection = await mysql.createConnection(conf);
    await connection.execute('DELETE FROM invoice_items WHERE InvoiceLineID=100');
  }catch(err){
    console.log(err);
  }
}




async function testi(res){
  try{
    const connection = await mysql.createConnection(conf);
    const [rows, fields] = await connection.execute('SELECT Title FROM albums');
    if(!rows) 
      rows=[];
      console.log(rows);
    res.json(rows);
  }catch(err){
    res.status(500).json({error: err.message})
  }
}


//app.use(express.static(__dirname+'/build'))

app.get('/test', async function (req, res) {
  testi(res);
});

app.get('/', function (req, res) {
  res.send('<h1>NICE</h1>');
});

const PORT = process.env.PORT || 3001

app.listen(PORT, function () {
  console.log('Server running on port'+PORT);
});
