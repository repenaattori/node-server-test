require('dotenv').config()
const axios = require('axios');
const {Client} = require('pg')

const pgclient = new Client({
    host: 'localhost',
    port: 5433,
    database:  'postgres',
    user: 'postgres',
    password: ''
});

connect();

async function connect(){
    try {
        await pgclient.connect();
        console.log('Valmist');
        let tulos =  await pgclient.query('SELECT * FROM employee WHERE company_id<$1 AND id>$2', [2,1]);
        console.log(tulos.rows);
    } catch (err) {
        console.error(err);
    }
}



