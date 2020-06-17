const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../util/geocoder');
const Bootcamp = require('../models/Bootcamp'); 

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBotcamps = asyncHandler(async (req, res, next) => {
    // try {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
    // } catch (err) {
    //     next(err);
    // }
});

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBotcamp =  asyncHandler(async (req, res, next) => {
    // try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            // return res.status(400).json({success: false});
            // wrong/not in db id
            return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
        }

        res.status(200).json({success: true, data: bootcamp});
    // } catch (err) {
    //     // res.status(400).json({success: false});
    //     // not formatted id
    //     // next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
    //     next(err);
    // }
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBotcamp =  asyncHandler(async (req, res, next) => {
    // try {
        const bootcamp = await Bootcamp.create(req.body);
    
        res.status(201).json({
            success: true,
            data: bootcamp
        });
    // } catch (err) {
    //     next(err);
    // }
});

// @desc        Update single bootcamps
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBotcamp =  asyncHandler(async (req, res, next) => {
    // try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
        }
    
        res.status(200).json({success: true, data: bootcamp});
        
    // } catch (err) {
    //     next(err);
    // }
});

// @desc        Delete single bootcamps
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBotcamp =  asyncHandler(async (req, res, next) => {
    // try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
        }
    
        res.status(200).json({success: true, data: {}});
        
    // } catch (err) {
    //     next(err);
    // }
});

// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBotcampInRadius =  asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc raiud using radians
    // Divide distance by radius of Earth
    // Earth radius = 3,963 mi - 6,378 km
    const radius = distance / 3963;
    
    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});