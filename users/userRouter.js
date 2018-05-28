'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {User} = require('./models');
const userRouter = express.Router();
const jsonParser = bodyParser.json();

//Post endpoint to register the new user
userRouter.post('/', jsonParser, (req, res) => {
 const requiredFields = ['username' , 'password', 'email'];
 console.log(requiredFields);
 const missingFields = requiredFields.find(field => !(field in req.body));

 if (missingFields){
     return res.status(422).json({
        code: 422,
        reason: 'Validation Error',
        message: 'Missing field',
        location: missingFields
     })
 }
 //Check that input values are of type 'String'
 const inputStrings = ["username", "password", "email", "firstName", "lastName"];
 const nonStrings = inputStrings.find(input => input in req.body 
    && typeof req.body[input] !== 'string');

if (nonStrings){
    return res.status(422).json({
        code:422,
        reason: 'Validation Error',
        message:"Invalid input type. Expected :String",
        location: nonStrings
    });
}

//Check to make sure there's no whitespace in username/password fields
const expectedTrimmedFields = ['username', 'password', 'email'];
const nonTrimmedFields = expectedTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
);
if (nonTrimmedFields){
    return res.status(422).json({
        code:422,
        reason: 'Validation Error',
        message:"Cannot have beginning/trailing whitespaces",
        location: nonTrimmedFields
    });
}

//Check that username and password are within mon, max length
const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation Error',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, email, role='lead', password, firstName = '', lastName = ''} = req.body;
  // Trim the firstName and lastName
  firstName = firstName.trim();
  lastName = lastName.trim();
  role=role.trim();
  const uniqueFields = ["username", "email"];

User.find({email}).count()
    .then(count =>{
        if (count >0){
            console.info("email account exists");
            return res.status(422).json({
                code: 422,
            reason: 'Validation Error',
            message: "Email already exists",
            location: 'email'
            });
    }
    return;
    //User does not exist so has password
    //return User.hashPassword(password);
    });
    User.find({username})
    .count()
    .then(count =>{
        if (count >0){
            console.info("count is", count);
            return res.status(422).json({
                code: 422,
                reason: 'Validation Error',
                message: 'Username already taken',
                location: 'username'
            });
        }
            //User does not exist so has password
        return User.hashPassword(password);
    })
    .then(hash =>{
        console.log(hash);
        return User.create({
            username,
            email,
            password:hash,
            firstName,
            lastName,
            role
        })
    })
    .then(user => {
        console.log("user is ", user);
        return res.status(201).json(user.serialize());
        })
    .catch(err =>{
        if (err.reason === 'Validation Error') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
        });
});// End POST to users end point

//Get endpoint to find all users in the system
userRouter.get('/', (req, res) => {
    return User.find()
      .then(users => res.json(users.map(user => user.serialize())))
      .catch(err => res.status(500).json({message: 'Internal server error'}))
});//End Get all users endpoint

//Get endpoint to get a particular user details
userRouter.get('/:userId', (req, res) => {
    return User.findById(req.params.userId)
            .then(user => res.json(user.serialize()))
            .catch(err => {
                console.error(err)
                res.status(500).json({error: 'Internal server error'})
            })
})


//PUT endpoint to api/users to update a particular user(ID)
userRouter.put('/:userId', jsonParser, (req,res) => {
    const userId = req.params.userId;
    console.log('inside userRouter PUT endpoint, req is ', req.body);
   const updated = {};
   const updateableFields = ['username', 'role', 'firstName', 'lastName'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            console.log("updating field", field);
            updated[field] = req.body[field];
        }
    });
    console.log("fields to be updated", updated)
    return User.findByIdAndUpdate(userId,
            { $set: updated},
            {new:true}
        )
        .then(updatedUser =>{
            console.log(updatedUser);
            return res.status(204).end();
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error:'Unable to modify record'});
        });
});

//Delete endpoint to delete a particular user details
userRouter.delete('/:username', (req, res) => {
    User.findOne({"username": `${req.params.username}`})
        .remove()
        .then(() => {
            console.log(`Deleted user record with username ${req.params.username}`);
            res.status(204).end();
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({error: 'Something went wrong'})
        })
})


module.exports = {userRouter};