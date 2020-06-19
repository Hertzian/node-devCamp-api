const express = require('express');
const {
    getCourses,
    getCourse,
    addCourse
} = require('../controllers/courses');

// merge the url params of the resource routes
const router = express.Router({mergeParams: true});

router
    .route('/')
    .get(getCourses)
    .post(addCourse);

router
    .route('/:id')
    .get(getCourse);

module.exports = router;