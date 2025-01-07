const express = require('express')
const reviewController = require('../controller/reviewController')
const authcontroller = require('../controller/authController')

const reviewRoutes = express.Router({ mergeParams: true})

/* add reviews. */
// reviewRoutes.post('/addreview', authcontroller.protect, authcontroller.restrictTo('user'), reviewController.addReview)

/* get your reviews. */
reviewRoutes.get('/yourreviews', authcontroller.protect, reviewController.yourReviews)

reviewRoutes.route('/')
.post(
    authcontroller.protect,
    authcontroller.restrictTo('user'),
    reviewController.addReview
)

module.exports = reviewRoutes