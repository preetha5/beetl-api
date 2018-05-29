
'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Product} = require('./models');
const productsRouter = express.Router();
const jsonParser = bodyParser.json();


//Get endpoint to find all products in the system
productsRouter.get('/', (req, res) => {
    console.log("inside get endpoint");
    Product.find()
      .then(products => res.json(products))
      .catch(err => res.status(500).json({message: 'Internal server error'}))
});//End Get all products endpoint

//Get endpoint to get a particular product details
productsRouter.get('/:productId', (req, res) => {
    Product.findById(req.params.productId)
        .then(product => res.json(product))
        .catch(err => {
            console.error(err)
            res.status(500).json({error: 'Something went wrong'})
        })
})

//post to create a product
productsRouter.post('/', jsonParser, (req, res) =>{
    console.log('inside the product router');
    let {name, title, description = ''} = req.body;
    const requiredFields = ['name', 'title'];
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Request is missing field: ${field}`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Product.create({
            name,
            title,
            description,
        })
        .then(product => res.status(201).json(product))
        .catch(err =>{
            console.log(err);
            if(err.code === 11000){
                return res.status(500).json({error:"duplicate entry"});
            }
            res.status(500).json({error: 'something went wrong'});
        });

});//End post '/' endpoint

//update a product object with a new object
//PATCH endpoint to api/Products , (eg: patch products notes to the corresponding record)
productsRouter.put('/:productId', jsonParser, (req,res) => {
    const productId = req.params.productId;
    console.log('inside product details PUT, body is ', req.body);
    // const requiredFields = ['name', 'id'];
    // for (let i=0; i<requiredFields.length; i++){
    //     const field = requiredFields[i];
    //     if(!(field in req.body)){
    //         const message = `Request is missing field: ${field}`;
    //         console.error(message);
    //         return res.status(400).send(message);
    //     }
    // }
    // if (productId !== req.body.id) {
    //     const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    //     console.error(message);
    //     return res.status(400).send(message);
    //   }
   const updated = {};
   const updateableFields = ['name', 'title', 'description'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            console.log("updating field", field);
            updated[field] = req.body[field];
        }
    });
    console.log("fields to be updated", updated)
    return Product.findByIdAndUpdate(productId,
            { $set: updated},
            {new:true}
        )
        .then(updatedProduct =>{
            console.log(updatedProduct);
            return res.status(200).json(updatedProduct);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:'Unable to modify record'});
        });
});

//Delete endpoint to delete a particular product
productsRouter.delete('/:productId', (req, res) => {
    console.log("Going to delete ", req.params.productId);
    Product.findById(req.params.productId)
        .remove()
        .then(() => {
            console.log(`Deleted product record with id 
                ${req.params.productId}`);
            res.status(204).end();
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({error: 'Something went wrong'})
        })
}) //End: Delete product endpoint


module.exports = {productsRouter};