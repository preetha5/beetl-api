'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    email:{
        type: String,
        unique: true,
        required: true
    },
    username:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    role:{
        type:String,
        default:'lead'
    },
    bugList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bug'
      }]
});

UserSchema.methods.serialize = function(){
    return {
        id:this._id,
        username:this.username || '',
        email:this.email || '',
        firstName: this.firstName || '',
        lastName: this.lastName || '',
        role:this.role || ''
    };
};

UserSchema.methods.validatePassword = function(password){
    return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password){
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};