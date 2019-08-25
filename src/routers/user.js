const express = require('express');

const User = require('../models/user');

// create a new router for user-related routes
const router = new express.Router();

// GET /users: fetch all users
// make callback async
router.get('/users', async (req, res) => {

    // try to get all users
    // success: 200
    // fail: 500
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send();
    }

});

// GET /users/:id: fetch a user by its id
// :id allows to catch the 'id' dynamic path variable
// make callback async
router.get('/users/:id', async (req, res) => {

    // req.params stores all path variables from the incoming route
    // so we access the id from it
    const _id = req.params.id;

    // try to get user by id
    try {

        const user = await User.findById(_id);

        // if user was not found, throw 404
        if (!user) {
            return res.status(404).send();
        }

        // user found: throw 200
        res.status(200).send(user);

    } catch (err) {
        // error on request: throw 500
        res.status(500).send(err);
    }

});

// POST /users: create a new user
// make the callback asynchronous to use async/await
router.post('/users', async (req, res) => {

    // use the request body parsed as JSON to create a new user
    const user = new User(req.body);

    // try to save
    // success: 201 and send user
    // fail: 400 and send error
    try {
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err);
    }

});

// PATCH /users/:id: update a user by its id
router.patch('/users/:id', async (req, res) => {

    // get id dynamic path variable
    const _id = req.params.id;

    // possible error: an update on an unknown field is trying to be updated
    
    // 1. get all keys (fields to update) from the request body 
    const updates = Object.keys(req.body);

    // 2. define statically the fields this User model is allowed to receive updates on
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    // every(): Array method, loops through each element, calling a callback that expects a 
    // boolean return; will return true if ALL predicates are true, and false if JUST ONE predicate is false
    // for the keys found in the request body, we will check if they exist on the static array of the allowed fields
    const isValidOperation = updates.every(update => {
        return allowedUpdates.includes(update);
    });

    // if any predicate returned a false statement, it meant that it was attempted to update an unknown field, 
    // so return a 400 with an error message
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        });
    }

    // try to find user by id and update with the request body JSON object (updated data)
    try {

        // for the pre-save middleware to work, we replace findByIdAndUpdate() with...
        // 1. findById()
        const user = await User.findById(_id);

        // 2. update properties manually
        updates.forEach(update => {
            user[update] = req.body[update];
        });

        // 3. use save() to actually trigger the middleware
        await user.save();

        // user not found: 404
        if (!user) {
            return res.status(404).send();
        }

        // sucess: 200 and send updated user data
        res.status(200).send(user);

    } catch (err) {
        // possible errors: internal server error and validation error
        res.status(400).send(err);
    }

});

// DELETE /users/:id: delete a user by its id
router.delete('/users/:id', async (req, res) => {

    // get id
    const _id = req.params.id;

    // try to
    try {

        // find user by id and delete
        const user = await User.findByIdAndDelete(_id);

        // user not found: 404
        if (!user) {
            return res.status(404).send();
        }

        // user found: 200
        res.status(200).send(user);

    } catch (err) {
        // error on request: 500
        res.status(500).send();
    }

});

// export the whole prepared user router to use on index.js and register
module.exports = router;