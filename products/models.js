'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const productSchema = mongoose.Schema({
        name:{type:String,required:true, unique:true},
        title:{type:String,required:true},
        description:{type:String},
        bugList: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bug'
          }]
})

const Product = mongoose.model('Product', productSchema);

module.exports = {Product}