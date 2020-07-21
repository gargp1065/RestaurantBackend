var express = require('express');
const bodyParser = require('body-parser')
var User = require('../models/user')
var passport = require('passport');
var router = express.Router();
var authenticate = require('../authenticate');
var cors = require('./cors')
router.use(bodyParser.json());
/* GET users listing. */


// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  })
  .catch((err) => console.log(err))
})

// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//   User.remove({})
//   .then((resp) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.statusCode = 200;
//     res.json(resp);

//   })
//   .catch((err) => console.log(err));
// });

router.post('/signup', cors.corsWithOptions,  (req, res, next) => {
  User.register( new User({username: req.body.username}), req.body.password, (err, user) => {
    console.log(req.body.username)
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err : 'Error'});
    }
    else {
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err : 'Error'});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json')
          res.json( {
          success: true,
          status: 'Registration SuccsessFul',
          });
        });
      })
    };
  });
});


router.post('/login', cors.corsWithOptions,  passport.authenticate('local'), (req, res) => {
  
  var token = authenticate.getToken({_id: req.user._id});
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token:token, status: 'Successfully Logged in'});
});


router.get('/logout', function(req,res,next) {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in');
    err.status = 403;
    return next(err);
  }
});


router.get('/facebook/token', 
passport.authenticate('facebook-token'), (req, res) => {
  if(req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token:token, status: 'Successfully Logged in'});
  }
})

module.exports = router;
