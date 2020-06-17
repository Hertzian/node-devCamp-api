const express = require('express');
const {
    getBotcamps,
    getBotcamp,
    createBotcamp,
    deleteBotcamp,
    updateBotcamp,
    getBotcampInRadius
} = require('../controllers/bootcamps');

const router = express.Router();

router
    .route('/radius/:zipcode/:distance')
    .get(getBotcampInRadius);

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