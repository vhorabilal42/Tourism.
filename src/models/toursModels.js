const mongoose = require("mongoose");
const validator = require("validator");
const user = require("./userModels"); // Import the user model
const { populate } = require("dotenv");

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name."],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration."],
  },
  rating: {
    type: String,
    default: "4",
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size."],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have difficulty levels."],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty must be either easy, medium, or difficult.",
    },
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price."],
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1."],
    max: [5, "Rating must be below 5."],
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should be below the regular price.",
    },
  },
  summary: {
    type: String,
    required: [true, "A tour must have a summary."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "A tour must have a description."],
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image."],
  },
  image: [String],
  createAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  // guides: Array,  /* this is used for embedding  */

  /* Now user and Tours are Separate entity  (Used the Refrencing.)*/

  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'user'
    },
  ],
},
{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});


/* 
// Embedding the guide.
tourSchema.pre("save", async function (next) {
  const guidesPromises = this.guides.map(async (id) => await user.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v'
    })
    next()
});

/* virtual populate. */
tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id'
})

// Define the model *after* the middleware
const Tour = mongoose.model("Tour-Table", tourSchema);

module.exports = Tour;