require('dotenv').config()
const mysql = require('mysql2/promise');

const multer = require('multer');
const upload = multer({ dest: "uploads/" });

var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const bcrypt = require('bcrypt');

// async function hashPw(plainPw){
//   const hash = await bcrypt.hash(plainPw, 10);
//   return hash;
// }
// async function verigyPw(password, hash){
//   const result = await bcrypt.compare(password, hash);
//   result ? console.log("Correct password!") : console.log("Incorrect password");
// }

// async function testHash(){
//   const hash = await hashPw("qwerty123");
//   verigyPw("qwerty123", hash);
//   verigyPw("aaa", hash);
// }

// testHash();




const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
  console.log('Server running on port ' + PORT);
});

const conf = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}

app.get('/', (req, res) => res.send('Home page'));

app.get('/user', (req, res) => res.json({ fname: 'Reima', lname: 'Riihimäki' }));

app.get('/users', (req, resp) => {
  const users = [
    { fname: 'Reima', lname: 'Riihimäki' },
    { fname: 'John', lname: 'Doe' },
    { fname: 'Lisa', lname: 'Simpson' }
  ];
  resp.json(users);
});

app.get('/customers', async (req, resp) => {
  try {
    const connection = await mysql.createConnection(conf);

    const [rows] = await connection.execute("SELECT * FROM customer");

    resp.json(rows.map(row => row.last_name));

  } catch (err) {
    resp.status(500).json({ error: err.message });
  }
});

app.get('/customer', async (req, resp) => {
  try {
    const connection = await mysql.createConnection(conf);

    const [rows] = await connection.execute("SELECT * FROM customer WHERE id=?", [req.query.id]);

    if (rows.length > 0) {
      resp.json(rows[0]);
    } else {
      resp.status(404).json({ error: "Resource not found" });
    }

  } catch (err) {
    resp.status(500).json({ error: err.message });
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
  try {
    console.log(req.body);
    resp.end();
  } catch (err) {
    resp.status(500).json({ error: err.message });
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

async function basicQuery() {
  try {
    const connection = await mysql.createConnection(conf);

    const name = 'Jack';
    const idLimit = 2;

    const [rows] = await connection.execute(
      'SELECT * FROM customer WHERE id>? AND first_name=?', [idLimit, name]);

    console.log(rows);

    //Return array of names (string)
    // const names = rows.map(row => row.first_name + " " + row.last_name)
    // console.log(names);

  } catch (err) {
    console.log(err);
  }
}

function printRow(row) {
  console.log(row.last_name);
}


async function testi(res) {
  try {
    const connection = await mysql.createConnection(conf);
    const [rows, fields] = await connection.execute('SELECT Title FROM albums');
    if (!rows)
      rows = [];
    console.log(rows);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


app.get('/special', async (req, res) => {
  try {

    const connection = await mysql.createConnection(conf);

    const [products] = await connection.execute('SELECT productLine,productName,buyPrice FROM products');
    const [pLines] = await connection.execute('SELECT productLine,textDescription FROM productlines');

    let json = pLines.map(pLine => {

      let lineProducts = products
        .filter(p => p.productLine === pLine.productLine)
        .map(p => ({ productName: p.productName, price: p.buyPrice }));

      return {
        productLine: pLine.productLine,
        textDesc: pLine.textDescription,
        products: lineProducts
      }
    });

    res.json(json);

  } catch (err) {
    res.status(500).json({ error: err.message, line: err.lineNumber })
  }
})
app.get('/special2', async (req, res) => {
  try {

    const connection = await mysql.createConnection(conf);
    const [pLines] = await connection.execute('SELECT productLine,textDescription FROM productlines');

    let json = [];

    for (const pl of pLines) {
      const [products] = await connection.execute('SELECT productName,buyPrice AS price FROM products WHERE productLine=?', [pl.productLine]);
      json.push({
        productLine: pl.productLine,
        textDesc: pl.textDescription,
        products: products
      });
    }

    res.json(json);

  } catch (err) {
    res.status(500).json({ error: err.message, line: err.lineNumber })
  }
})

app.get('/query', async (req, res) => {
  try {


    //Get customer's all orders and their products and also sum of each order.
    //Get customer's order dates and the sum of the product prices in each order
    let customerNumber = 128;

    const connection = await mysql.createConnection(conf);

    const [products2] = await connection.execute(
      'SELECT DISTINCT productName FROM products WHERE productCode IN ' + 
      '(SELECT productCode FROM orderDetails WHERE orderNumber IN' + 
      '( SELECT orderNumber FROM orders WHERE customerNumber=? ))', [customerNumber]);


    const [products] = await connection.execute(
      'SELECT DISTINCT products.productName FROM products ' +
      'JOIN orderDetails ON products.productCode=orderDetails.productCode ' +
      'JOIN orders ON orders.orderNumber=orderDetails.orderNumber WHERE orders.customerNumber=?', [customerNumber]);


    res.json(prod.map(p=>p.productName));

  } catch (err) {
    res.status(500).json({ error: err.message, line: err.lineNumber })
  }
})


//app.use(express.static(__dirname+'/build'))

// app.get('/test', async function (req, res) {
//   testi(res);
// });


