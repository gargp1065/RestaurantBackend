var passport = require('passport');
var LocalStragety = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy  
var jwt = require('jsonwebtoken') 
var ExtractJwt = require('passport-jwt').ExtractJwt;

var config = require('./config');
const e = require('express');
exports.local = passport.use(new LocalStragety(User.authenticate()));
passport.serializeUser(User.serializeUser());   //
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(
        user, config.secretKey, 
        {expiresIn: 4000}
    )
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT paylod: "+ jwt_payload )
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            else if(user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        })
    }

))
exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = function(req, res, next) {
    if(req.user.admin) {
       return next();
    }
    else {
        res.statusCode = 404;
        res.json("Not Authorized");
        return ;
    }
}

///User.serilaizeusr provided by the p-l-m module.
//Helps t0 store the data required for the session storage.