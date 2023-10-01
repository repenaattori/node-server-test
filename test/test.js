let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../verkkokauppa');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET products', ()=>{
    it('it should get all the products', (done) => {
        chai.request(server)
            .get('/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            })
    })
})


describe('Array', ()=>{
    describe('#indexOf()', ()=>{
        it('should return -1 when the value is not present', ()=>{
            assert.equal([1,2,3].indexOf(4), -1);
        })
    })
})