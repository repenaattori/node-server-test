require('dotenv').config()
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const multer = require('multer');
const upload = multer({ dest: "uploads/" });

var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log('Server running on port ' + PORT);
});

const conf = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: false,
    timezone: '+00:00'
}


/**
 * Gets all the products
 */
app.get('/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(conf);

        const [rows] = await connection.execute("SELECT id, product_name name, price, image_url imgUrl  FROM product");

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Gets all the categories
 */
app.get('/categories', async (req, res) => {

    try {
        const connection = await mysql.createConnection(conf);

        const [rows] = await connection.execute("SELECT category_name name, category_description description FROM product_category");

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * Adds new product category
 */
app.post('/addcategory', async (req, res) => {

    try {
        const connection = await mysql.createConnection(conf);
    
        const category = req.body;
        
        const [info] = await connection.execute("INSERT INTO product_category VALUES (?,?)",[category.name, category.description]);
    
        res.status(200).send("Category added!");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * Adds new product category
 */
app.post('/addproduct', async (req, res) => {

    try {
        const connection = await mysql.createConnection(conf);
    
        const product = req.body;
        
        const [info] = await connection.execute("INSERT INTO product (product_name, price, image_url,category) VALUES (?,?,?,?)",[product.name, product.price, product.imageUrl, product.category]);
    
        res.status(200).send("Product added!");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * Place an order 
 */
app.post('/order', async (req, res) => {

    let connection;

    try {
        connection = await mysql.createConnection(conf);
        connection.beginTransaction();

        const order = req.body;
        
        const [info] = await connection.execute("INSERT INTO customer_order (order_date, customer_id) VALUES (NOW(),?)",[order.customerId]);
        
        const orderId = info.insertId;

        for (const product of order.products) {
            await connection.execute("INSERT INTO order_line (order_id, product_id, quantity) VALUES (?,?,?)",[orderId, product.id, product.quantity]);            
        }

        connection.commit();
        res.status(200).end();

    } catch (err) {
        connection.rollback();
        res.status(500).json({ error: err.message });
    }
});


//(Authentication/JWT could be done with middleware also)


/**
 * Registers user. Supports urlencoded and multipart
 */
app.post('/register', upload.none(), async (req,res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const uname = req.body.username;
    const pw = req.body.pw;

    try {
        const connection = await mysql.createConnection(conf);

        const pwHash = await bcrypt.hash(pw, 10);

        const [rows] = await connection.execute('INSERT INTO customer(first_name,last_name,username,pw) VALUES (?,?,?,?)',[fname,lname,uname,pwHash]);

        res.status(200).end();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

/**
 * Checks the username and password and returns jwt authentication token if authorized. 
 * Supports urlencoded or multipart
 */
app.post('/login', upload.none(), async (req, res) => {

    const uname = req.body.username;
    const pw = req.body.pw;

    try {
        const connection = await mysql.createConnection(conf);

        const [rows] = await connection.execute('SELECT pw FROM customer WHERE username=?', [uname]);

        if(rows.length > 0){
            const isAuth = await bcrypt.compare(pw, rows[0].pw);
            if(isAuth){
                const token = jwt.sign({username: uname}, 'mysecretkey');
                res.status(200).json({jwttoken: token});
            }else{
                res.status(401).end('User not authorized');
            }
        }else{
            res.status(404).send('User not found');
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * Gets orders of the customer
 */
app.get('/orders', async (req,res) => {
    
    //Get the bearer token from authorization header
    const token = req.headers.authorization.split(' ')[1];

    //Verify the token. Verified token contains username
    try{
        const username = jwt.verify(token, 'mysecretkey').username;
        const orders = await getOrders(username);
        res.status(200).json(orders);
    }catch(err){
        console.log(err.message);
        res.status(403).send('Access forbidden.');
    }
});


async function getOrders(username){
    try {
        const connection = await mysql.createConnection(conf);
        const [rows] = await connection.execute('SELECT customer_order.order_date AS date, customer_order.id as orderId FROM customer_order INNER JOIN customer ON customer.id = customer_order.customer_id WHERE customer.username=?', [username]);

        let result = [];

        for (const row of rows) {
            const [products] = await connection.execute("SELECT id,product_name productName,price,image_url imageUrl, category, quantity  FROM product INNER JOIN order_line ON order_line.product_id = product.id WHERE order_line.order_id=?", [row.orderId]);

            let order ={
                orderDate: row.date,
                orderId: row.orderId,
                products: products
            }

            result.push(order);
        }


        return result;
    } catch (err) {
       throw new Error(err.message);
    }
}

// app.get('/test', async (req,res) => {
    
//     try {
//         const connection = await mysql.createConnection(conf);
    
//         const [rows] = await connection.execute('UPDATE customer SET pw=? WHERE id=1', [await bcrypt.hash('repe',10)]);

//         res.send("done");
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });