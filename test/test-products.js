'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const should = chai.should();
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../server');
//Import config data
const {TEST_DATABASE_URL, PORT} = require('../config');
const jwt = require('jsonwebtoken');
const { User } = require('../users');
const { Product } = require('../products/models');
const { JWT_SECRET } = require('../config');
const {createAuthToken} = require('../auth/authRouter');
chai.use(chaiHttp);

//This function is used to teardownDb
function tearDownDB(){
    return new Promise((resolve, reject) => {
        console.warn("Deleting test DB collection...");
        mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err));
    })
}

//function to create some fake products
function seedProductsData(){
    const seedData = [];
    for (let i = 1; i <= 5; i++) {
        seedData.push({ 
            products:{
                "name" : faker.hacker.noun(), 
                "title" : faker.hacker.noun(), 
                "description" : faker.lorem.sentence(), 
            }            
        })
    }
}

//BEGIN TESTS
describe('Product endpoints', function () {
    const email = 'exampleUser@test.com';
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = "joe";
    const lastName = "smith";
    let authToken;
    const name = 'sample product';
    const title = 'The Product';
    const description = 'An awesome little product';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    console.log(password);
    return User.hashPassword(password).then(password =>
        
      User.create({
        username,
        email,
        password,
        firstName,
        lastName
      })
    );
  });

  beforeEach(function(done){
    User.findOne()
        .then(user =>{
        authToken = createAuthToken(user);
        console.log("In before each authtoken is :" , authToken);
        done();
        })
});

  beforeEach(function () {
    return seedProductsData();
  });

  afterEach(function () {
    console.log("removing user");
    return User.remove({});
  });
  
  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDB();
    });

  after(function(){ 
    return closeServer();
    });

//Test should find all products for a given user
describe('POST endpoint', function () { 
    it('should add a new product', function(){
        const newProduct = {
            name :'sample product',
            title : 'The Product',
            description : 'An awesome little product'
        }
        return chai.request(app)
        .post(`/api/products`)
        .set('Authorization',`bearer ${authToken}`)
        .send(newProduct)
        .then(function(response){
            console.log("res body is ", response.body);
            expect(response).to.have.status(201);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.include.keys(
                '_id', 'name', 'title', 'description', 'bugList');
            });
        });
    });
});