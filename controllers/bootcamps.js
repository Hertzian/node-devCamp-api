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

        let query;

        // this, for request query
        const reqQuery = {...req.query};

        // Fields to exclude for filtering
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operator $gt, $gte, etc (<,>,etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
        
        // Format select fields (on mongoose docs)
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            // console.log(fields)
            query = query.select(fields);
        }

        // Sort, in the url params
        // for asc values: &sort=name
        // for desc values: &sort=-name
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const bootcamps = await query;

        // Pagination result
        const pagination = {};

        if(endIndex < total){
            pagination.next =  {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev =  {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({success: true, count: bootcamps.length, pagination, data: bootcamps});
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