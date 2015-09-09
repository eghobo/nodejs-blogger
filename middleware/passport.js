let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let User = require('../models/user');
let util = require('util');

require('songbird');

module.exports = (app) => {
    // Use email since id doesn't exist
    passport.serializeUser(nodeifyit(async (user) => user._id));

    passport.deserializeUser(nodeifyit(async (id) => {
        return await User.findById(id).exec();
    }));

    passport.use('local', new LocalStrategy({
        usernameField: 'username',
        failureFlash: true
    }, nodeifyit(async (username, password) => {
        username = (username || '').toLowerCase();
        let user = await User.promise.findOne({username: username});
        if (!user) {
            user = await User.promise.findOne({email: username});
        }

        if (!user) {
            return [false, {message: 'Invalid username or email'}]
        }

        let passwordHash = await user.generateHash(password);
        if (passwordHash.toString('hex') !== user.password) {
            return [false, {message: 'Invalid password'}]
        }
        return user
    }, {spread: true})));

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        failureFlash: true
    }, nodeifyit(async (req, email, password) => {
        email = (email || '').toLowerCase();
        // Is the email taken?
        if (await User.promise.findOne({email: email})) {
            return [false, {message: 'That email is already taken.'}]
        }

        let {username, title, description} = req.body;

        if( await User.promise.findOne({username:{$regex: new RegExp(username, 'i')}})){
            return [false, {message: 'That Username is already taken.'}]
        }

        // create the user
        let user = new User();
        user.email = email;
        user.username = username;
        user.blogTitle = title;
        user.blogDescription = description;

        // Use a password hash instead of plain-text
        user.password = password;

        try {
            return await user.save()
        }
        catch(e) {
            console.log(util.inspect(e));
            return [false, {message: e.message}]
        }
    }, {spread: true})));
};




