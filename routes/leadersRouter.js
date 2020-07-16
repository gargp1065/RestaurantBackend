const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate')
const leadersRouter = express.Router();
leadersRouter.use(bodyParser.json());

leadersRouter.route('/')

.get((req, res, next) => {
    Leaders.find({})
    .then((leaders) => {
        res.setHeader('Contert-Type', 'application/json')
        res.statusCode = 200;
        res.json(leaders); 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Leaders.create(req.body) 
    .then((leader) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
        console.log('added leader:\n', leader)
    }, (err) => next(err))
    .catch((err) => next(err))
})

.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    res.statusCode = 403;
    res.end("You cannot put on this page");
})

.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Leaders.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
    }, (err) => next(err))
    .catch((err) => next(err))
});

leadersRouter.route('/:leaderId')

.get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        console.log("Leader c: \n", leader)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, {new: true}) ///???
    .then((leader) => {
        console.log("Leader created: \n", leader)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    res.statusCode = 403;
    res.end(`Post operation not supported`);
})

.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // authenticate.verifyAdmin(req, res, next);
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = leadersRouter;