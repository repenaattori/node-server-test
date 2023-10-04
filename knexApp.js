const options = {
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'postgres'
    }
}

const knex = require('knex').knex(options);


function queryTest(){
    knex.from('employee').select('*')
        .then(rows => console.log(rows))
        .catch(e => console.log(e))
}

function insertTest(){
    const employees = [
        {name: "Liisa Lehtonen", company_id: 2},
        {name: "Simo Samis", company_id: 1},
    ]
    
    knex('employee').insert(employees)
        .then(()=>console.log('Data inserted'))
        .catch(e=>console.log(e))
}

