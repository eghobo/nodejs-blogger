let mongoose = require('mongoose');
let nodeify = require('bluebird-nodeify');

require('songbird');

let commentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: String,
        required: true
    },
    create_date: Date,
    update_date: Date
});

commentSchema.pre('save', function(next) {
    nodeify(async () => {
        if (!this.isModified('password'))
            this.update_date = Date.now();

        if (!this.create_date ) {
            this.create_date = Date.now();
        }
    }(), next)
});

module.exports = mongoose.model('Comment', commentSchema);
