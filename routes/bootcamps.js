const express = require('express');
const {
    getBotcamps,
    getBotcamp,
    createBotcamp,
    deleteBotcamp,
    updateBotcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

// Include othe resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

// pagination & advanced filtering
const advancedResults = require('../middleware/advancedResults');
// user authorize
const {protect, authorize} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

//Bootcamps routes
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius);

router
    .route('/:id/photo')
    // important order of protect() and authorize()
    // because authorize() uses/depend req.user from protect()
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBotcamps)
    .post(protect, authorize('publisher', 'admin'), createBotcamp);

router
    .route('/:id')
    .get(getBotcamp)
    .put(protect, authorize('publisher', 'admin'), updateBotcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBotcamp);

module.exports = router;