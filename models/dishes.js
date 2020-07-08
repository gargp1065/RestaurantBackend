const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
var commentSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
})

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String, 
        required: true
    },
    label: {
        type: String, 
        default: ''
    },
    category: {
        type: String, 
        required: true
    },
    price: {
        type: Currency,
        min: 0, 
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
},{
        timestamps: true
})

var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes;