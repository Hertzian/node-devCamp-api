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
const advancedResults = require('../middleware/advancedResults')

// Include othe resource routers
const courseRouter = require('./courses');
const { route } = require('./courses');

const router = express.Router();

// user authorize
const {protect} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

//Bootcamps routes
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius);

router
    .route('/:id/photo')
    .put(protect, bootcampPhotoUpload);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBotcamps)
    .post(protect, createBotcamp);

router
    .route('/:id')
    .get(getBotcamp)
    .put(protect, updateBotcamp)
    .delete(protect, deleteBotcamp);

module.exports = router;