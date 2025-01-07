const { populate } = require("dotenv");
const Tour = require("../models/toursModels");

const createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            message: "Tour is create",
            status: "success",
            data: {
                Tour: newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
};

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObject = { ...this.queryString };
        const excludedField = ["page", "limit", "sort", "field"];
        excludedField.forEach((el) => delete queryObject[el]);
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        console.log(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createAt");
        }
        return this;
    }

    limit() {
        if (this.queryString.fields) {
            const fieldQuery = this.queryString.fields.split(",").join(" ");
            console.log(fieldQuery);
            this.query = this.query.select(fieldQuery); // Updated from `query = query.select()`
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

// Controllers
const getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limit()
            .pagination();
        const tours = await features.query;  // Updated to `tours` for clarity

        res.status(200).json({
            status: "success",
            results: tours.length,
            data: { tours },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,  // More specific error message
        });
    }
};

const getTour = async (req, res) => {
    const id = req.params.id;
    try {
        const tour = await Tour.findById(id).populate({
            path: 'reviews',
            // populate: {
            //     path: 'user',
            //     select: 'name email'
            // }
        });
        // Tour.findOne({ _id: req.params.id })   /* populate is used to fill the data using reference. */
        res.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // show the update record
            runValidators: true, // the validator put in mondoDB is also apply during update.
        });
        res.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        // await Tour.findByIdAndDelete(req.params.id)  // This is Good Practise
        const tour = await Tour.findByIdAndDelete(req.params.id); // Only for demo
        console.log(tour);

        res.status(204).json({
            status: "success",
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
};

const getTourStats = async (req, res)=>{
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage : {$gte: 3.0}}
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: {$sum : 1},
                    averageRating: {$avg: '$ratingAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            }
        ]);
        res.status(200).json({
            status: 'success',
            data:{
                stats
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
}

const getMonthlyPlan = async (req, res)=>{
    try {
        const year = req.params.year * 1   /* trick to conver into a number */
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
        
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error,
        });
    }
}
module.exports = {
    createTour,
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan
};
