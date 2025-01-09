const express = require('express');
const tourController = require('../controller/tourController')
const middlewareTour = require('../middleware/top5tours')
const authController = require('../controller/authController')
// const reviewcont = require('../controller/reviewController')
const reviewrouts = require('../routes/reviewRoutes');
const tourRouter = express.Router()

/* Nested Routes */
tourRouter.use('/:tourId/reviews', reviewrouts)

tourRouter.get('/top-5-cheap', middlewareTour.aliseTopTours,tourController.getAllTours)

tourRouter.get('/tour-stats', tourController.getTourStats)
tourRouter.get('/monthly-plan/:year', tourController.getMonthlyPlan)

tourRouter
    .route('/')
    /*  before getAllTours we called the middleware to check user is login or Not */
    /*  we implements the Authetication before getAllTours. */
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour)

tourRouter
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour)

/*  add reviews according to the tours. */

// tourRouter.route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewcont.addReview
// )

module.exports = tourRouter