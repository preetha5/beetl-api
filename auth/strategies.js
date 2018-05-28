'use strict';
const { Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const {User} = require('../users');
const { JWT_SECRET } = require('../config');

//Verify that user is providing the correct credentials
const localStrategy = new LocalStrategy({usernameField: 'email'},(username, password, callback) =>{
    let user;
    console.log("inside local strategy ", username);
    User.findOne({email: username})
        .then(_user => {
            user = _user;
            console.log("inside local strategy ", user);
            if(!user){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            return user.validatePassword(password);
        })
        .then(isValid =>{
            if(!isValid){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            console.log("inside local strategy :pwd is valid ");
            return callback(null, user);
        })
        .catch(err => {
            if(err.reason === 'LoginError'){
                return callback(null, false, err);
            }
            return callback(err,false);
        });
});

const jwtStrategy = new JwtStrategy(
{  secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
},
(payload, done) =>{
    console.log("payload", payload);
    done(null, payload.user);
}
);
module.exports = { localStrategy, jwtStrategy};