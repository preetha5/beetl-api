'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {User} = require('../users/models');
const {Product} = require('../products/models');
const {Bug} = require('./models');
const bugsRouter = express.Router();
const jsonParser = bodyParser.json();


//Get endpoint to find all bugs in the system
bugsRouter.get('/', (req, res) => {
    console.log("inside get endpoint");
    Bug.find()
      .then(bugs => res.json(bugs))
      .catch(err => res.status(500).json({message: 'Internal server error'}))
});//End Get all products endpoint



//Find all bugs for a certain product ID
bugsRouter.get('/product/:productId',(req,res) => {
    const productId = req.params.productId;
    console.log("productId ", productId);
    return Product
            .findById(productId)
            .populate('bugList')
            .then(product => {
                console.log(product);
                res.status(200).json(product);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({message: 'Internal server error'})
            })
});//End get('/product/:productId')

//Find all bugs for a certain assignee (user email)
bugsRouter.get('/user/:userId',(req,res) => {
    const userId = req.params.userId;
    console.log("user is  ", userId);
    return User
            .findById(userId)
            .populate('bugList')
            .then(user => {
                console.log(user);
                res.status(200).json(user);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({message: 'Internal server error'})
            })
});//End get('/product/:productId')

//post to create a bug
bugsRouter.post('/', jsonParser, (req, res) =>{
    console.log('inside the bug router');
    let {bugId, title, description,priority, 
        severity,status, dueDate, productId, version, reporter, assignee} = req.body;
    const requiredFields = ['bugId', 'title', 'description', 'productId'];
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Request is missing field: ${field}`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    let newBug;
    return Bug.create({
            bugId,
            title,
            description,
            priority, 
            severity,
            status, 
            dueDate, 
            productId, 
            version,
            reporter,//user Id
            assignee//user Id
        })
        .then(bug => {
            newBug = bug;
            //find the product with product ID
            return Product.findById(productId)
        })
        //push the bug into the right product
        .then(product => {
            console.log("newBug is ", newBug);
            product.bugList.push(newBug);
            product.save();
            console.log("product is ", product);
        })
        .then(() => User.findById(assignee))
        //push the bug into the right user(assignee)
        .then((user) => {
            console.log("user is ", user);
            user.bugList.push(newBug);
            user.save();
        })
        .then(() => {
            console.log(newBug);
            return res.status(201).json(newBug)
        })
        .catch(err =>{
            console.log(err);
            if(err.code === 11000){
                return res.status(500).json({error:"duplicate entry"});
            }
            res.status(500).json({error: 'something went wrong'});
        });

});//End post '/' endpoint


//PUT to api/bugs ENDPOINT to update a particular user(ID)
bugsRouter.put('/:bugId', jsonParser, (req,res) => {
    const bugId = req.params.bugId;
    console.log('inside userRouter PUT endpoint, req is ', req.body);
   const updated = {};
   const updateableFields = [
        'title',
        'description',
        'priority', 
        'severity',
        'status', 
        'dueDate', 
        'productId', 
        'version',
        'reporter',
        'assignee'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            console.log("updating field", field);
            updated[field] = req.body[field];
        }
    });
    console.log("fields to be updated", updated)
    return Bug.findByIdAndUpdate(bugId,
            { $set: updated},
            {new:true}
        )
        .then(updatedBug =>{
            console.log(updatedBug);
            return res.status(201).json(updatedBug);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:'Unable to modify record'});
        });
});//End PUT to update a Bug

//Delete a bug with a product ID
bugsRouter.delete('/:bugId', (req, res) => {
    Bug.findOne({"bugId": `${req.params.bugId}`})
        .remove()
        .then(() => {
            console.log(`Deleted product record with name ${req.params.bugId}`);
            res.status(204).end();
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({error: 'Something went wrong'})
        })
}) //End: Delete product endpoint

module.exports = {bugsRouter};