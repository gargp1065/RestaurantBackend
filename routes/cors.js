var express = require('express')
var cors = require('cors');
const f = require('session-file-store');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    //to check the incoming origin or request is in the whitelist  
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin : true};
    }
    else {
        corsOptions = {origin: false};
    }
    callback(null, corsOptions);
}
exports.cors = cors();
///to apply for a specific route
exports.corsWithOptions = cors(corsOptionsDelegate);