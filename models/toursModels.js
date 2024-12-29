const mongoose = require('mongoose');
const validator = require('validator')

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name.'],
        // unique: true
        trim: true,
        validate: [validator.isAlpha, 'Tour name must be contain Alphabets.']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have duration.']
    },
    rating: {
        type: String,
        default: 4
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group Size.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have Diffeculty levels.'],
        enum: {                                 /*   Validation   */
            values: ['easy', 'medium', 'difficult' ],
            message: 'Difficulty is either : easy, medium, difficult.'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a Price.']
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating above the 1.'],
        max: [5, 'Rating is below the 5.']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){            /*  Custom Validator. */
                return val < this.price;
            },
            message: 'Discount price should be below than price.'
        }      
    },
    summary: {
        type: String,
        required: [true, 'A tour must have Summary.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A tour must have Description.']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have Cover Image.']
    },
    image: [String],
    createAt: {
        type: Date,
        default: Date.now(),
        select: false /* Hide this filed when we give the response */
    },
    startDates: [Date]

});

const Tour = mongoose.model('Tour-Table', tourSchema);
// Tour-Table is table name in tours Database.

module.exports = Tour;

