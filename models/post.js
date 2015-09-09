let mongoose = require('mongoose');
let nodeify = require('bluebird-nodeify');

require('songbird')

let postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'},
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    create_date: Date,
    update_date: Date
});

postSchema.pre('save', function(next) {
    nodeify(async () => {
        if (!this.isModified('password'))
            this.update_date = Date.now();

        if (!this.create_date ) {
            this.create_date = Date.now();
        }
    }(), next)
});

module.exports = mongoose.model('Post', postSchema);
