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
  database: process.env.DB_DATABASE,
  dateStrings: false,
  timezone: '+00:00'
}

app.post('transaktio', async (req,res) => {

  const connection = null;

  try{  
    connection = await mysql.createConnection(conf);

    await connection.beginTransaction();

    await connection.execute('UPDATE * account SET balance=balance-?', [req.body.money]);
    await connection.execute('UPDATE * account SET balance=balance+?', [req.body.money]);

    await connection.commit();

    res.status(200).end();
    
  }catch(err){
    if(connection != null){
      await connection.rollback();
    }
    res.status(500).json({error: err.message});
  }
})

app.post('/order', async (req,res) => {

  let connection = null;
  
  try{  

    let orderData = req.body; 

    connection = await mysql.createConnection(conf);
    await connection.execute("SET time_zone=?", ['+00:00']);
    await connection.beginTransaction();
    
    let [result] = await connection.execute('SELECT MAX(orderNumber) AS maxId FROM orders');
    let orderNumber = result[0].maxId + 1;

    await connection.execute('INSERT INTO orders (orderNumber,orderDate,requiredDate,customerNumber, status) ' + 
      'VALUES (?,NOW(),?,?,?)', [orderNumber, orderData.requiredDate, orderData.customerId, 'In Process']);

    let sqlCommand = "INSERT INTO orderdetails (orderNumber, productCode, quantityOrdered, priceEach, orderLineNumber) VALUES ";
    let params = [];

    orderData.products.forEach((p,i) => {
        params.push(orderNumber, p.code, p.quantity, p.unitPrice, i+1);
        sqlCommand += "(?,?,?,?,?),";
        if(i === p.length - 1){
          sqlCommand += ","
        }
      }
    );

    await connection.execute(sqlCommand, params);
    await connection.commit();

    res.status(200).end();
    
  }catch(err){
    if(connection != null){
      await connection.rollback();
    }
    res.status(500).json({error: err.message});
  }
});


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

app.post('/products', async (req, resp) => {
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

testTimezone();

async function testTimezone(){
  try{

    const connection = await mysql.createConnection(conf);
    await connection.execute("SET time_zone=?", ['+00:00']);

    const [x] = await connection.execute('INSERT INTO timetest (create_time) VALUES (NOW())');
    
    console.log(x.insertId);
  }catch(err){
    console.log(err.message);
  }
}
async function getTime(){
  try{
    const connection = await mysql.createConnection(conf);

    const [res] = await connection.execute('SELECT * FROM timetest');
    
    console.log(res[0].create_time);

    
  }catch(err){
    console.log(err.message);
  }
}

app.get('/alltimes', async (req, resp) =>{
  try{  
    const connection = await mysql.createConnection(conf);

    const [times] = await connection.execute("SELECT * FROM timetest");

    resp.json(times);
    
  }catch(err){
    resp.status(500).json({error: err.message});
  }
});

app.post('/order', async (req, resp) => {
  try{  
    const connection = await mysql.createConnection(conf);

    const [rows] = await connection.execute("SELECT * FROM customer WHERE id=?", [req.query.id]);

    
  }catch(err){
    resp.status(500).json({error: err.message});
  }
});



let d = new Date("2023-05-13T16:41:29.000Z");
console.log(d);
console.log(d.toLocaleString());

console.log( d.getHours() );
