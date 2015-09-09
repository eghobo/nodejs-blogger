let mongoose = require('mongoose');
let crypto = require('crypto');
let nodeify = require('bluebird-nodeify');

require('songbird');

let SALT = 'CodePathHeartNodeJS';

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    blogTitle: String,
    blogDescription: String
});


userSchema.methods.generateHash = async function(password) {
    return (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');
};

userSchema.path('password').validate((password) => {
    return (password.length >= 4) && (/[A-Z]/.test(password)) && (/[a-z]/.test(password)) && (/[0-9]/.test(password));
});

userSchema.pre('save', function(next) {
    nodeify(async () => {
        if (!this.isModified('password'))
            return next();
        this.password = await this.generateHash(this.password)
    }(), next)
});

module.exports = mongoose.model('User', userSchema);
