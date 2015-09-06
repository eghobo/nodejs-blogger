let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let SALT = 'CodePathHeartNodeJS';
let User = require('../models/user');

module.exports = (app) => {
    // Use email since id doesn't exist
    passport.serializeUser(nodeifyit(async (user) => user.email));

    passport.deserializeUser(nodeifyit(async (email) => {
        return await User.findOne({email}).exec();
    }));

    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        failureFlash: true
    }, nodeifyit(async (email, password) => {
        email = (email || '').toLowerCase();
        let user = await User.promise.findOne({email});
        if (!user) {
            return [false, {message: 'Invalid username'}]
        }

        let passwordHash = await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256');
        if (passwordHash.toString('hex') !== user.password) {
            return [false, {message: 'Invalid password'}]
        }
        return user
    }, {spread: true})));

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        failureFlash: true
    }, nodeifyit(async (email, password) => {
        email = (email || '').toLowerCase();
        // Is the email taken?
        if (await User.promise.findOne({email})) {
            return [false, {message: 'That email is already taken.'}]
        }

        // create the user
        let user = new User();
        user.email = email;
        // Use a password hash instead of plain-text
        user.password = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
        return await user.save()
    }, {spread: true})));
};




