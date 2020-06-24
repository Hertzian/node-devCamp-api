const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

const User = require('../models/User');

// merge the url params of the resource routes
const router = express.Router({mergeParams: true});

// pagination & advanced filtering
const advancedResults = require('../middleware/advancedResults');
// user authorize
const {protect, authorize} = require('../middleware/auth');

// to protect all routes from this point
router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser)
    

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router;