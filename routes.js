let passport = require('passport');
let isLoggedIn = require('./middleware/isLoggedIn');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('index.ejs', {
            message: req.flash('error')
        })
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs', {})
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {})
    });

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    });

    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: true
    }));

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
};

