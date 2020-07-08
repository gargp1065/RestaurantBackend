const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose')
const Promotions = require('../models/promotions')
const authenticate = require('../authenticate')
const promotionsRouter = express.Router();

promotionsRouter.use(bodyParser.json());

promotionsRouter.route('/')
.get((req, res, next) => {
    Promotions.find({})
    .then((promotions) => {
        res.setHeader('Contert-Type', 'application/json')
        res.statusCode = 200;
        res.json(promotions); 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Promotions.create(req.body) 
    .then((promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
        console.log('added promotion:\n', promotion)
    }, (err) => next(err))
    .catch((err) => next(err))
})

.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("You cannot put on this page");
})

.delete(authenticate.verifyUser, (req, res, next) =>{
    Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
    }, (err) => next(err))
    .catch((err) => next(err))
});

promotionsRouter.route('/:promoId')

.get((req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        console.log("promotions c: \n", promotion)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, {new: true}) ///???
    .then((promotion) => {
        console.log("promotions created: \n", promotion)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Post operation not supported`);
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = promotionsRouter;