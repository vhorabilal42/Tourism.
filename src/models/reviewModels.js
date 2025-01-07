/* review, rating, createdAt, ref to Tour, ref to User */

const mongodb = require('mongoose');

const review = mongodb.Schema({
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'A review must have Rating.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongodb.Schema.ObjectId,
        ref: 'Tour-Table',
        required: [true, 'A review must have tours']
    },
    user: {
        /* parent refrancing. */
        type: mongodb.Schema.ObjectId,
        ref: 'user',
        required: [true, 'A review must have user.']
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

review.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name email'
    })
    next()
})

const reviewModel = mongodb.model('review', review);

module.exports = reviewModel;