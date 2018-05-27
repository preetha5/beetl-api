'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bugSchema = mongoose.Schema({
        bugId:{type:String,required:true, unique:true},
        title:{type:String,required:true},
        description:{type:String},
        priority:{type:String},
        severity:{type:String},
        reporter:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        assignee:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        version:{type: Number,default:1.0},
        dueDate:{type:Date,default: Date.now},
        status:{ type:String, default:'open'}
})

const Bug = mongoose.model('Bug', bugSchema);
module.exports = {Bug}