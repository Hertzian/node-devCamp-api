const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const { model } = require('../models/User');
const { Server } = require('http');

// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    const {name, email, password, role} = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    // Create token
    // const token = user.getSignedJwtToken();

    // res.status(200).json({success: true, token});

    sendTokenResponse(user, 200, res);
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    // Validate email & password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user, select() is to get and validate password
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    // Needs await because in the model user.matchPassword() returns a promise
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // // Create token
    // const token = user.getSignedJwtToken();

    // res.status(200).json({success: true, token});

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    // getSignedJwtToken() is in the userSchema
    const token = user.getSignedJwtToken();

    // Options to process cookie parser declared in server.js
    const options = {
        expires: new Date(Date.now() +process.env.JWT_COOKIE_EXPIRE * 24 *60 *60 * 1000),
        httpOnly: true,
    }

    // For secure flag in cookie when its in production
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    // Generate a cookie and returning result
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({success: true, token});
}

// @desc        Get currernt logged user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async(req, res, next) => {
    // this because in auth middleware req.user is available that uses that middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({success: true, data: user});
})