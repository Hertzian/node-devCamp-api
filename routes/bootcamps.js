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

// Include othe resource routers
const courseRouter = require('./courses');
const { route } = require('./courses');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

//Bootcamps routes
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampInRadius);

router
    .route('/:id/photo')
    .put(bootcampPhotoUpload);

router
    .route('/')
    .get(getBotcamps)
    .post(createBotcamp);

router
    .route('/:id')
    .get(getBotcamp)
    .put(updateBotcamp)
    .delete(deleteBotcamp);

module.exports = router;