#!/usr/bin/env node

// npm modules
const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    function(email, password, done) {
        // console.log('Inside local strategy callback')
        axios.get('http://localhost:5000/users?email=' + email)
        .then( function(res) {
            const user = res.data[0]
            if (!user) {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
            return done(null, user);
        })
        .catch(function(error) { done(error) })
    }
));

// tell passport how to serialize the user
passport.serializeUser( function(user, done) {
    // console.log('Inside serializeUser callback. User id is save to the session file store here')
    done(null, user.id);
})

passport.deserializeUser( function(id, done) {
    // console.log('Inside deserializeUser callback')
    axios.get('http://localhost:5000/users/' + id)
    .then( function(res) { done(null, res.data) })
    .catch(error => done(error, false))
})
  
// create server
const app = express();

// port for localhost
const PORT = 3000;

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    genid: function(req) {
        // console.log('Inside the session middleware');
        // console.log(`Request object sessionID from client: ${req.sessionID}`)
        return uuid()
    },
    store: new FileStore(),
    secret: 'Happy Llama',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// create the homepage as '/'
app.get('/', function(req, res){
    // console.log('Inside the homepage callback function')
    // console.log(req.sessionID)
    res.send('Hit home page.\n')
});

// create the login get and post routes
app.get('/login', function(req, res) {
    // console.log('Inside GET /login callback function')
    // console.log(req.sessionID)
    res.send('You got the login page!\n')
});

// POST to login user via passport
app.post('/login', function(req, res, next) {

    // console.log('Inside POST /login callback function')

    passport.authenticate('local', function(err, user, info) {
        // console.log('Inside passport.authenticate() callback')
        // console.log('req.session.passport: ' + JSON.stringify(req.session.passport))
        // console.log('req.user: ' + JSON.stringify(req.user))
        if (info)  { return res.send(info.message) }
        if (err)   { return next(err); }
        if (!user) { return res.redirect('/login'); }

        req.login(user, function(err) {
            // console.log('Inside req.login() callback')
            // console.log('req.session.passport: ' + JSON.stringify(req.session.passport))
            // console.log('req.user: ' + JSON.stringify(req.user))
            if (err) { return next(err); }
            return res.redirect('/authrequired')
        })
    })(req, res, next);
});

// route that required authentication
app.get('/authrequired', function(req, res) {
    // console.log('Inside GET /authrequired callback')
    // console.log('User authenticated? ' + req.isAuthenticated())
    if (req.isAuthenticated()) {
        res.send('you hit the authenticated endpoint\n')
    } else {
        res.redirect('/')
    }
})

// create listener
app.listen(PORT, function() {
    console.log('listening on localhost' + PORT)
});