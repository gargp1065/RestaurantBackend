var express = require('express')
var mongoose = require('mongoose')
var authenticate = require('../authenticate')
var FavoriteDishes = require('../models/favorites') 
var bodyParser = require('body-parser')
var cors = require('./cors')
const { reset } = require('nodemon')

const favoriteRouter = express.Router();


favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions , (req, res) => {res.sendStatus(200)})
.get( authenticate.verifyUser, (req, res,next) => {
    if(req.user) {
        FavoriteDishes.find({user : req.user.id})
        .populate('user dishes')
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json')
            return res.json(resp);
        })
        .catch((err) => next(err));
    }
    else {
        err = new Error('User Not Authorized');
        res.statusCode = 404;
        return next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteDishes.find({user: req.user._id})
    .then((resp) => {
        if(resp.length !== 0) {
            for(var i=0 ; i< req.body.length; i++) {
                var objectId = mongoose.Types.ObjectId(req.body[i]);
                resp[0].dishes.push(objectId);
            }
            resp[0].save()
            .then((favdish) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favdish)
            })
        }
        else {
            var arr = [];
            for(var i=0 ; i< req.body.length; i++) {
                var objectId = mongoose.Types.ObjectId(req.body[i]);
                arr.push(objectId);
            }
            FavoriteDishes.insertMany({ user : req.user._id , dishes : arr})
            .then((dish) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(dish)
            })
            .catch((err) => next(err))
        }       
    })
    .catch((err) => next(err));

})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    FavoriteDishes.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp);
    })
    .catch((err) => next(err));
})




favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions , (req, res) => {res.sendStatus(200)})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var objectId = mongoose.Types.ObjectId(req.params.dishId);
    FavoriteDishes.find({user: req.user._id})
    .then((resp) => {
        if(resp.length !==0) {
            resp[0].dishes.push(objectId);
            resp[0].save()
            .then((favdish)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favdish);
            })
            .catch((err) => next(err));
        }
        else {
            FavoriteDishes.insertMany([{user: req.user._id, dishes: [objectId]}])
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(dish)
                return ;
            })
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var objectId = mongoose.Types.ObjectId(req.params.dishId);
    FavoriteDishes.find({user : req.user._id})
    .then((favdish) => {
        var indx = favdish[0].dishes.indexOf(objectId);
        if(indx > -1) {
            favdish[0].dishes.splice(indx, 1);
            favdish[0].save()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(resp);
            })
            .catch((err) => next(err));
        }
        else {
            err = new Error('Dish not marked as fav dish');
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch((err) => next(err));
})

module.exports = favoriteRouter;



