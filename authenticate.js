var passport = require('passport');
var LocalStragety = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy  
var jwt = require('jsonwebtoken') 
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookTokenStrategy = require('passport-facebook-token')

var config = require('./config');
const e = require('express');
const { use } = require('passport');
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
};

exports.facebookPassport = passport.use(new
    FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        User.findOne({facebookId: profile.id}, (err, user) =>{
            if(err) {
                return done(err, false);
            }
            if(!err &&  user !==  null) {
                return done(null, user);
            }
            else {
                user = new User({username: profile.displayName});
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if(err) {
                        return done(err, false)
                    }
                    else {
                        return done(null, user);
                    }
                })
            }
        })
    }
))

///User.serilaizeusr provided by the p-l-m module.
//Helps t0 store the data required for the session storage.