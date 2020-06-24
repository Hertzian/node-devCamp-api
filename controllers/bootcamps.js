const path = require('path');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../util/geocoder');
const Bootcamp = require('../models/Bootcamp'); 

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBotcamps = asyncHandler(async (req, res, next) => {
    // try {
        // format for url params:
        // ?careers[in]=Business
        // ?averageCost[gte]=10000&location.city=Boston
        // console.log(req.query)// this have the url params

        
        // advancedResults comes from route, its in middleware folder
        res.status(200).json(res.advancedResults);
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

        // Add user to req.body
        req.body.user = req.user.id;
        
        // Check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

        // If the user is not an admin, they can only add one bootcamp
        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(
                    `The user with Id ${req.user.id} has already published a bootcamp`,
                    400)
            );
        }

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
        // this for delete on cascade works (Bootcamp model)
        // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        const bootcamp = await Bootcamp.findById(req.params.id);
    
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
        }

        bootcamp.remove();
    
        res.status(200).json({success: true, data: {}});
        
    // } catch (err) {
    //     next(err);
    // }
});

// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampInRadius =  asyncHandler(async (req, res, next) => {
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

// @desc        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload =  asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
    }
    
    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    // console.log(req.files)
    const file = req.files.file;

    // Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // mv() function is in req.files.file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });

    // console.log(file.name)

});