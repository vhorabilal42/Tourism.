const express = require('express');
const authController = require('../controller/authController');
const user = require('../models/userModels');
const userController = require('../controller/userController')

const userRoutes = express.Router()

/*      SignUp ( Create Profile ) */
userRoutes.post('/signup', authController.signUp)

/*      Login Routes     */
userRoutes.post('/login',authController.login)

/*      forgotPassword & resetPassword  */
userRoutes.post('/forgotpassword', authController.forgotPassword)

userRoutes.patch('/resetpassword/:token', authController.resetPassword)

userRoutes.post('/updatepassword',authController.protect, authController.updatePassword)

userRoutes.patch('/updateMe', authController.protect, userController.updateMe)

userRoutes.delete('/deleteMe', authController.protect, userController.deleteMe)

userRoutes.get('/getAllUsers', userController.getAllUsers)

module.exports = userRoutes


