const reviewModel = require('../models/reviewModels')


const addReview = async (req, res) => {
    const {review, rating} = req.body;
    const reviewsbody = {
        review ,
        rating,
        tour: req.params.tourId,
        user: req.user
    }
    try {
        const newReview = await reviewModel.create(reviewsbody);
        res.status(201).json({
            status: 'success',
            message: 'Review is add succesfully.',
            data: {
                newReview
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail' || 'Bad Request.',
            message: error.message || 'Review is Not add.'
        })
    }
};

const yourReviews = async (req, res) => {
    try {
        // Fetch reviews with populated user and tour references
        const yourReviews = await reviewModel
            .find({ user: req.user._id }) // Ensure req.user contains the user's ID
            // .populate('user', 'name email') // Populate specific fields for the user
            // .populate('tour', 'name price'); // Populate specific fields for the tour

        // Check if no reviews are found
        if (yourReviews.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'You have not given any reviews.'
            });
        }

        // Return the reviews
        return res.status(200).json({
            status: 'success',
            data: {
                reviews: yourReviews
            }
        });
    } catch (error) {
        // Handle errors
        return res.status(400).json({
            status: 'fail',
            message: error.message || 'Bad Request.'
        });
    }
};


module.exports = {
    addReview,
    yourReviews
}