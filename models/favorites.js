const express = require('express')
const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;

// var dishSchema = new Schema({
//     dish: {
//         type: String
//     }
// })
const favoriteDishSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, 
    dishes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]
})

var FavoriteDishes = mongoose.model('FavoriteDish',  favoriteDishSchema);
module.exports = FavoriteDishes;