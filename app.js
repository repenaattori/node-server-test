require('dotenv').config()
const mysql = require('mysql2/promise');

const multer = require('multer');
const upload = multer({ dest: "uploads/" });

var express = require('express');
var app = express();
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
  console.log('Server running on port '+PORT);
});

const conf = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}

app.get('/', (req, res) => res.send('Home page'));

app.get('/user', (req, res) => res.json({ fname:'Reima', lname: 'Riihimäki' }));

app.get('/users', (req, resp) => {
  const users = [
    { fname:'Reima', lname: 'Riihimäki' },
    { fname:'John', lname: 'Doe' },
    { fname:'Lisa', lname: 'Simpson' }
  ];
  resp.json(users);
});

app.get('/customers', async (req, resp) => {
  try{  
    const connection = await mysql.createConnection(conf);

    const [rows] = await connection.execute("SELECT * FROM customer");

    resp.json(rows.map(row => row.last_name));
    
  }catch(err){
    resp.status(500).json({error: err.message});
  }
});

app.get('/customer', async (req, resp) => {
  try{  
    const connection = await mysql.createConnection(conf);

    const [rows] = await connection.execute("SELECT * FROM customer WHERE id=?", [req.query.id]);

    if(rows.length>0){
      resp.json(rows[0]);
    }else{
      resp.status(404).json({error: "Resource not found"});
    }
    
  }catch(err){
    resp.status(500).json({error: err.message});
  }
});

// app.post('/customer', upload.none(), async (req, resp) => {
//   try{ 
//     console.log(req.body.fname); 
//     resp.end();
//   }catch(err){
//     resp.status(500).json({error: err.message});
//   }
// });

app.post('/customer', async (req, resp) => {
  try{ 
    console.log(req.body); 
    resp.end();
  }catch(err){
    resp.status(500).json({error: err.message});
  }
});

//console.log(process.env);

// demo();


// async function demo(){
//   try{
//     const connection = await mysql.createConnection(conf);
//     await connection.execute("INSERT INTO customer (first_name, last_name) VALUES ('Jamie','Oliver')");
//   }catch(err){
//     console.log(err);
//   }
// }

//basicQuery();

async function basicQuery(){
  try{  
    const connection = await mysql.createConnection(conf);

    const name='Jack';
    const idLimit = 2;

    const [rows] = await connection.execute(
      'SELECT * FROM customer WHERE id>? AND first_name=?', [idLimit, name]);
    
      console.log(rows);

    //Return array of names (string)
    // const names = rows.map(row => row.first_name + " " + row.last_name)
    // console.log(names);

  }catch(err){
    console.log(err);
  }
}

function printRow(row){
  console.log(row.last_name);
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

// app.get('/test', async function (req, res) {
//   testi(res);
// });

app.get('/', function (req, res) {
  res.send('<h1>NICE</h1>');
});


