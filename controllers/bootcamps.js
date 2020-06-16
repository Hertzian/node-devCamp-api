const ErrorResponse = require('../util/errorResponse');
const Bootcamp = require('../models/Bootcamp'); 

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBotcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
    } catch (err) {
        res.status(400).json({success: false});
    }
}

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBotcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            // return res.status(400).json({success: false});
            // wrong/not in db id
            return next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
        }

        res.status(200).json({success: true, data: bootcamp});
    } catch (err) {
        // res.status(400).json({success: false});
        // not formatted id
        next(new ErrorResponse(`Bootcamp not found id of ${req.params.id}`, 404));
    }
}

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBotcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
    
        res.status(201).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

// @desc        Update single bootcamps
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBotcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    
        if(!bootcamp){
            return res.status(400).json({success: false});
        }
    
        res.status(200).json({success: true, data: bootcamp});
        
    } catch (err) {
        res.status(400).json({success: false});
    }
}

// @desc        Delete single bootcamps
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBotcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
        if(!bootcamp){
            return res.status(400).json({success: false});
        }
    
        res.status(200).json({success: true, data: {}});
        
    } catch (err) {
        res.status(400).json({success: false});
    }
}