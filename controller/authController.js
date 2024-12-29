const { promisify } = require('util')
const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email')
const crypto = require('crypto');

const signToken = function (id) {
  return jwt.sign(
    { id },                               /*   payload    */
    process.env.JWT_SECRET,              /*   Secret Key */
    {
      expiresIn:
        process.env.JWT_EXPIRE_TIME      /*   Expire Time */
    }
  )
}

const createSendToken = (user, statusCode, res)=>{
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production'){
    cookieOptions.secure = true;
  }

  // remove password from output.
  user.password = undefined
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
};

const signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChange: req.body.passwordChange,
      role: req.body.role
    });

    /*  
    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    });
    */

    /*const token = signToken(newUser._id)

    res.status(201).json({
      status: "success",
      token,
      data: {
        newUser,
      },
    });*/

    createSendToken(newUser, 201, res)

  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: `User is Not SignUp succesfully. ${error}`,
    });
  }
};


/*    Why we used the return (what is told you.) */
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    /*  step-1 Check email and password is exist or Not; email & password field must be exist   */

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields is required.'
      })
    }

    /* step-2 check user exist & password is correct  */

    const isUser = await User.findOne({ email: email }).select('+password');

    if (!isUser || !await isUser.correctPassword(password, isUser.password)) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect Email OR Password.'
      });
    }

    /*  step 3 If every things is OK send token   */

    // const token = signToken(isUser._id)
    /*
    return res.status(200).json({
      status: 'success',
      token
    });
    */

    createSendToken(isUser, 200, res)

  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: `Login was not successful. ${error}`
    });
  }
};

const protect = async (req, res, next) => {

  let token;
  let decode;

  /*  1) Getting token and check of it's there  */
  /* send token using http header with request */

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not Logged in! Please log in to get access'
    })
  }


  /*  2) Verification Token */
  try {
    decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decode);

  } catch (error) {
    return res.status(401).json({
      message: error
    })
  }

  /*  3) Check if user still exists */
  const freshUser = await User.findById(decode.id)
  // console.log(freshUser);
  if (!freshUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'The user belonging to this token does not exist.',
    })
  }

  /*  4) Check if user changed password after the token was issued  */
  /*  token is issued and then password is change we check for that. */

  if (freshUser.changePasswordAfter(decode.iat)) {
    return res.status(401).json({
      success: 'fail',
      message: 'Please Login'
    })
  }

  req.user = freshUser
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    /*  roles = ['admin', 'lead-guide']  & role = user*/

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: 'fail',
        message: `You don't have permission to delete this.`
      })
    }
    next()
  }
};

const forgotPassword = async (req, res) => {
  /*  1)  get user based on posted email */

  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'This Email is not exist.'
    })
  }

  /*  2) generate the reset random token */

  const resetToken = user.createPasswordResetToken();
  await user.save();

  /*  3) send token to user email */
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetpassword/${resetToken}`

  const message = `Forgot your password.\n
  ${resetURL}. \n 
  If you didn't ignore this email`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(Valid for 10 min)',
      message
    })
    res.status(200).json({
      status: 'success',
      message: 'Token send to Email!'
    })

  } catch (error) {
    res.status(400).json({
      sussess: 'fail',
      message: message.error
    })
  }
};

const resetPassword = async (req, res) => {
  /* 1)  Get the user based on the token  */
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log('Hashed token', hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  // console.log(user);

  /* 2)  If token is not expire and there is a user, set the new password  */
  if (!user) {
    res.status(400).json({
      status: 'fail',
      message: 'Token is Expire OR Invalid.'
    })
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  /* 3)  Update the change passwordAt property for the user  */

  /* 4)  Log the user in, send JWT  */

  /*
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  })
  */

  createSendToken(user, 200, res)

};

const updatePassword = async (req, res) => {
  const currentPassword = req.body.currentPassword

  try {
    /*  1) get user from collection */
    const user = await User.findOne({ _id: req.user.id }).select('+password');

    /*  2) Check if POSTed current password is correct or not */
    const isCorrect = await user.correctPassword(currentPassword, user.password)

    /*  3) If so, update the password */
    if (!isCorrect) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password is not correct.'
      })
    }
    user.password = req.body.Password
    user.passwordConfirm = req.body.conformPassword
    await user.save()
    /*  4) Log user in, send JWT */

    /*
    const token = signToken(user._id)
    return res.status(201).json({
      status: 'success',
      message: 'password is updated succesfully.',
      data: {
        token
      }
    })
    */

    createSendToken(user, 201, res)

  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message
    })
  }
}

module.exports = {
  signUp, login,
  protect, restrictTo,
  forgotPassword, resetPassword,
  updatePassword
};

