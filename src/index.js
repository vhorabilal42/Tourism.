const express = require('express');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')

const tourRoutes = require('./routes/tourRoutes')
const userRoutes = require('./routes/userRoutes')
const reviews = require('./routes/reviewRoutes')
const app = express();

// GLOBAL Middleware

/*  Set Security HTTP Headers. */
app.use(helmet())

app.use((req, res, next) => {
    console.log('Hello from the middleware 👋');
    next();
});

/*  Limit request from same IP  */
const limiter = rateLimit({
    max: 100,
    WindowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP try after an Hour.'
})

app.use('/api',limiter)

/*  Body-parser, reading data from the body into req.body */
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
/* Limit the amount of data come in body.
app.use(express.json({ limit: '10kb' }));

in body data large than 10kb is not accepted.
*/


/* Data sanitization against NOSQL query injection */
app.use(mongoSanitize());

/* Data sanitization against xss */
app.use(xssClean())


app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/reviews', reviews);

/* 
app.all('*', (req, res, next)=>{
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server.`
    })
})
*/

app.all('*', (req, res, next)=>{
    const err = new Error(`Can't find ${req.originalUrl} on this server !`)
    err.status = 'fail';
    err.statusCode = 404;
    next(err)
})
/*  In next() only err is put as a parameter; if you write like next(req) express take this req as error 
    we only write next(err)
*/

/*  Error Handle middleware (global) */
app.use((err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
})

module.exports = app;