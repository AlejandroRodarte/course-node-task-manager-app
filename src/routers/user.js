const express = require('express');

const User = require('../models/user');

// import the authentication middleware
const auth = require('../middleware/auth');

// multer library to upload files
const multer = require('multer');

// create a new router for user-related routes
const router = new express.Router();

// store user profile images on /avatars
const avatar = multer({
    dest: 'avatars'
});

// GET /users/me: fetch logged in user
// make callback async
// we attached on the auth middleware a 'user' property to the request so we can send it
router.get('/users/me', auth,  async (req, res) => {
    res.send(req.user);
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

        // persist user
        await user.save();

        // generate token and persist again
        const token = await user.generateAuthToken();

        // respond with user data and generated token
        res.status(201).send({
            user,
            token
        });

    } catch (err) {
        res.status(400).send(err);
    }

});

// POST /users/me/avatar: store user profile picture
// on request form-body, search for the 'avatar' key and store file on /avatars
router.post('/users/me/avatar', avatar.single('avatar'), (req, res) => {
    res.status(201).send(); 
});

// POST /users/login: login with user credentials
router.post('/users/login', async (req, res) => {

    // try to find user by credentials and validate password
    // validated: 200
    // unvalidated: 400
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);

        // generate a JWT for that particular user
        const token = await user.generateAuthToken();

        // respond with the user data and the generated token
        res.status(200).send({
            user,
            token
        });

    } catch (err) {
        res.status(400).send();
    }

});

// POST /users/logout: logout user
router.post('/users/logout', auth, async (req, res) => {

    // try to
    try {

        // remove the request token (current) from the user token's list
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);

        // req.user is a mere reference to the same user model, so persist with save and send 200 status code
        await req.user.save();
        res.status(200).send();

    } catch (err) {
        res.status(500).send();
    }

});

// POST /users/logoutAll: logout user from all devices
router.post('/users/logoutAll', auth, async (req, res) => {

    // try to remove all tokens from the user's tokens array and persist
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).send();
    }

});

// PATCH /users/me: update a user by its id
// use auth middleware to authenticate user before running route handler
router.patch('/users/me', auth, async (req, res) => {

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

        // update properties to the user in the request object manually
        // we no longer use findByIdAndUpdate since it was already found in the middleware
        updates.forEach(update => {
            req.user[update] = req.body[update];
        });

        // 3. use save() to actually trigger the middleware
        await req.user.save();

        // sucess: 200 and send updated user data
        res.status(200).send(req.user);

    } catch (err) {
        // possible errors: internal server error and validation error
        res.status(400).send(err);
    }

});

// DELETE /users/me: delete a user by its id
// use auth middleware to authenticate user before running route handler
router.delete('/users/me', auth, async (req, res) => {

    // try to
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (err) {
        // error on request: 500
        res.status(500).send();
    }

});

// export the whole prepared user router to use on index.js and register
module.exports = router;