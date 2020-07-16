const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const authenticate = require('../authenticate');
const Dishes = require('../models/dishes');

const dishesRouter = express.Router();

dishesRouter.use(bodyParser.json());


dishesRouter.route('/')
.get((req, res, next) => {
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log("Dish created: \n", dish)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Put operation not supported`);
})


.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishesRouter.route('/:dishId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        console.log("Dish created: \n", dish)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {new: true}) ///???
    .then((dish) => {
        console.log("Dish created: \n", dish)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Post operation not supported`);
})

.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});





dishesRouter.route('/:dishId/comments')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish!=null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }   
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            res.statusCode = 404;
            return next(err);
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Dishes.findById(req.params.dishId)
    .then((dish)=> {
        if(dish!=null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json')
                        res.json(dish)
                    })     
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            res.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err)); 
})

.put(authenticate.verifyUser, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    res.statusCode = 403;
    res.end(`Put operation not supported`);
})


.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null) {
            for(var i=0; i<dish.comments.length; i++) {
                dish.comments.id(comments[i].__id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish)
            }, (err) => next(err))
        }
        else {
            res.statusCode = 404;
            console.log("No dish found");
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishesRouter.route('/:dishId/comments/:commentId')

.get((req, res, next) => {
    
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish!=null && dish.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if(dish == null){
            err = new Error('Dish' + req.params.dishId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json');
            return next(err);  
        }
        else {
            err = new Error('Comments' + req.params.commentId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json')
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

.put(authenticate.verifyUser, (req, res, next) => { 
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null && dish.comments.id(req.params.commentId)) {
            var i;
            for(i=0;i<dish.comments.length; i++) {
                console.log(req.user.id);
                console.log(dish.comments[i]);
                if(req.user.id == dish.comments[i].author) {
                    if(req.body.rating) {
                        dish.comments[i].rating = req.body.rating;
                    }
                    if(req.body.comments) {
                        dish.comments[i].comment = req.body.comment;
                    }
                    dish.save()
                    .then((dish) => {
                        Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish=> {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }))
                    })
                    break;
                }
            }
            if(i == dish.comments.length) {
                res.statusCode = 404;
                res.json("No comments found of the user");
                return ;
            }
        }
        else if(dish == null){
            err = new Error('Dish' + req.params.dishId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json');
            return next(err);  
        }
        else {
            err = new Error('Comments' + req.params.commentId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json')
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Post operation not supported`);
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null && dish.comments.id(req.params.commentId)!=null) {
            var i;
            for(i=0; i<dish.comments.length; i++) {

                if(req.user.id == dish.comments[i].author) {
                    dish.comments[i].remove()
                    dish.save()
                    .then((dish) => {
                        Dishes.findById(dish._id)
                        .populate('comments.author') 
                        .then((dish) => {
                            res.statusCode = 200;
                            // res.setHeader('Content-Type', 'application/json')
                            res.json(dish)
                        })
                    })
                    break;
                }
            }
            if(i == dish.comments.length) {
                res.statusCode = 404;
                res.json("Not have appropiate rights");
                return ;
            }
        }
        else if(dish == null){
            err = new Error('Dish' + req.params.dishId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json');
            return next(err);  
        }
        else {
            err = new Error('Comments' + req.params.commentId + 'not found')
            res.statusCode = 404;
            // res.setHeader('Content-Type', 'application/json')
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
});

module.exports = dishesRouter;