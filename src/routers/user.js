const express = require('express');

const User = require('../models/user');

// import the authentication middleware
const auth = require('../middleware/auth');

// multer library to upload files
const multer = require('multer');

// sharp for image conversion
const sharp = require('sharp');

// create a new router for user-related routes
const router = new express.Router();

// store user profile images on /avatars
const avatar = multer({

    // limit filesize to 1MB
    limits: {
        fileSize: 1000000
    },

    // file filter
    fileFilter(req, file, cb) {

        // allow only .jpg, .jpeg or .png files
        // sad path: return callback with error
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload either a .jpg, .jpeg or .png file.'));
        }

        // happy path: return callback with no error an flag to let update begin
        cb(undefined, true);

    }

});

// GET /users/me: fetch logged in user
// make callback async
// we attached on the auth middleware a 'user' property to the request so we can send it
router.get('/users/me', auth,  async (req, res) => {
    res.send(req.user);
});

// GET /users/id/avatar: get a user's profile picture
router.get('/users/:id/avatar', async (req, res) => {

    // get id
    const _id = req.params.id;

    try {

        // get user by id
        const user = await User.findById(_id);

        // check if user was found and has a defined avatar field
        // sad path: throw error
        if (!user || user.avatar === undefined) {
            throw new Error('Image not found.');
        }

        // happy path: inform the requester the data sent back is an image so it can render it
        res.set('Content-Type', 'image/png');
        res.status(200).send(user.avatar);

    } catch (err) {
        res.status(404).send({
            error: err.message
        });
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
// place before the upload middleware the authentication check
router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => {
    
    // by not configuring the 'dest' property on the multer instance, Multer grants
    // access to the file to upload on the Express route handler so that we can persist
    // it into a database

    // the place where the file is found is on req.file
    // req.file.buffer contains the file's binary data
    // use sharp; pass the original buffer, resize to 250 x 250 px apply png() method to 
    // convert to .png and parse back to binary data
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    // store the sharp parsed image binary data
    req.user.avatar = buffer;

    // persist the changes to the database
    await req.user.save();

    res.status(201).send();

}, (error, req, res, next) => {

    // when an error is thrown on middleware, send back JSON with error message
    res.status(400).send({
        error: error.message
    });

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

// DELETE /users/me/avatar: delete a user's profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {

    // try to
    try {

        // clear the user's avatar field and persist the changes
        req.user.avatar = undefined;
        await req.user.save();

        res.status(200).send();

    } catch (err) {
        res.status(500).send({
            error: err.message
        });
    }

});

// export the whole prepared user router to use on index.js and register
module.exports = router;