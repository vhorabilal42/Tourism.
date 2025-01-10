const express = require('express')
const reviewController = require('../controller/reviewController')
const authcontroller = require('../controller/authController')

const reviewRoutes = express.Router({ mergeParams: true})

/* add reviews. */
// reviewRoutes.post('/addreview', authcontroller.protect, authcontroller.restrictTo('user'), reviewController.addReview)

/* get reviews for a specific persion. */
reviewRoutes.get('/yourreviews', authcontroller.protect, reviewController.yourReviews)

reviewRoutes.route('/')
.post(
    authcontroller.protect,
    authcontroller.restrictTo('user'),
    reviewController.addReview
)

/* Get only tour revews. */
reviewRoutes.get('/',authcontroller.protect,
    reviewController.tourReviews
)


/* Delete Reviews. */
reviewRoutes.delete('/:id', authcontroller.protect, 
    authcontroller.restrictTo('user'), 
    reviewController.deleteReviews);

/* Update Reviews. */
reviewRoutes.patch('/:id', authcontroller.protect, 
    authcontroller.restrictTo('user'), 
    reviewController.updateReview)

module.exports = reviewRoutes