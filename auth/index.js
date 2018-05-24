'use strict';
const {localStrategy, jwtStrategy} =  require('./strategies');
const {Router} = require('./authRouter');
module.exports = {Router, localStrategy, jwtStrategy};