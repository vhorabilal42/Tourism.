const aliseTopTours = (req, res, next)=>{
    req.query.limit ='5';
    req.query.sort = '-ratingAverage,-price';
    // req.query.fields = 'name, price, ratingAverage';
    next()
}

module.exports = {
    aliseTopTours
}