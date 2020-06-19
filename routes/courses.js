const express = require('express');
const {
    getCourses,
} = require('../controllers/courses');

// merge the url params of the resource routes
const router = express.Router({mergeParams: true});

router
    .route('/')
    .get(getCourses)

module.exports = router;