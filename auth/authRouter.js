'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const Router = express.Router();

const createAuthToken = function(user) {
    console.info("creating auth token with user", user);
    console.info("token expires at config.JWT_EXPIRY", config.JWT_EXPIRY);
    return jwt.sign({user}, config.JWT_SECRET, 
        {
            subject: user.username,
            expiresIn: config.JWT_EXPIRY,
            algorithm: 'HS256'
        });
};

const localAuth = passport.authenticate('local', {session: false});

Router.use(bodyParser.json());

Router.post('/', localAuth, (req,res) =>{
    console.info("inside login post route", req.body);
    const authToken = createAuthToken(req.user.serialize());
    const email = req.body.email;
    const username = req.body.username;
    res.json({authToken,email, username });
});

const jwtAuth = passport.authenticate('jwt', {session:false});

Router.post('/refresh', jwtAuth, (req, res) => {
    console.log("trying to refresh token");
    const authToken = createAuthToken(req.user);
    res.json({authToken});
});

module.exports = {Router, createAuthToken};