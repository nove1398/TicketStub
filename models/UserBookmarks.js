const Mongoose = require('mongoose');
const Schema = Mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    title: {
        type: String
    },
    event: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    }
});


Schema.statics.getMyBookmarks = function (userId) {
    return this.model('Bookmark')
        .find({
            user: userId
        })
        .populate('event', 'eventName _id createdDate eventFlyer isActive')
        .select({
            _id: 1,
            title: 1,
            event: 1
        })
        .exec();
}

Schema.statics.getIsBookmarkSaved = function (userId, bookmarkId) {
    return this.model('Bookmark')
        .countDocuments({
            user: userId,
            event: bookmarkId
        })
        .exec();
}
Schema.statics.removeBookmark = function (userId, markId) {
    return this.model('Bookmark')
        .findOneAndRemove({
            user: userId,
            _id: markId
        })
        .exec();
}

module.exports = Mongoose.model('Bookmark', Schema, 'Bookmarks');