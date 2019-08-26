const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');

// create a new router for task endpoints
const router = new express.Router();

// GET /tasks: fetch all tasks related to a particular user
// make callback an async function
// use the authentication middleware
router.get('/tasks', auth, async (req, res) => {

    // match empty object
    const match = {};

    // if 'complete' query param exists, set a 'completed' property on the empty object
    // with the corresponding boolean value
    if (req.query.completed) {
        match.completed = req.query.completed === 'true' ? true : false;
    }

    try {

        // find all tasks where their 'owner' foreign key matches the logged in user's
        // primary key
        // populate according to some search criteria defined in the 'match' object
        await req
                .user
                .populate({
                    path: 'tasks',
                    match
                })
                .execPopulate();

        res.status(200).send(req.user.tasks);

    } catch (err) {
        res.status(500).send(err)
    }

});

// GET /tasks/:id: fetch a task by its id
// make callback async
// add the authentication middleware
router.get('/tasks/:id', auth, async (req, res) => {

    // capture the id path variable
    const _id = req.params.id;

    // try to get the task by its id and their own user id to verify
    // the task to fetch is one created by such user and not an unknown one
    try {

        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        // not found: 404
        if (!task) {
            return res.status(404).send();
        }

        // found: 200
        res.status(200).send(task);

    } catch (err) {
        // error on request: 500
        res.status(500).send(err);
    }

});

// POST /tasks: create a new task and persist
// make async callback
// make it use the authentication middleware (provides the author's document in the request)
router.post('/tasks', auth, async (req, res) => {

    // create a new task model instance with the author's id
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    // try to save
    // success: 201
    // fail: 400
    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }

});

// PATCH /tasks/:id: update a particular task by its id
// use auth middleware
router.patch('/tasks/:id', auth, async (req, res) => {

    // fetch dynamic id
    const _id = req.params.id;

    // get field names from request body and full list of updatable field names
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];

    // check if every request body field name is included in the allowed updatable field name list
    const isValidOperation = updates.every(update => {
        return allowedUpdates.includes(update);
    });

    // use final predicate result
    // false: attempted to update unknown field; set 400
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        });
    }

    // try to
    try {

        // for the pre-save middleware to work, we replace findByIdAndUpdate() with...
        // 1. findOne() to find task by id and by its foreign user's id (verify task was made by user)
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        // no task was found: 404
        if (!task) {
            return res.status(404).send({
                error: 'No task was found.'
            });
        }
        
        // 2. update manually each property
        updates.forEach(update => {
            task[update] = req.body[update];
        });

        // 3. use save() to actually trigger the middleware
        await task.save();

        // happy path: 200
        res.status(200).send(task);

    } catch (err) {
        // error on request (by server or validation): 400 (for now)
        res.status(400).send(err)
    }

});

// DELETE /tasks/:id: delete a task based on its id
// add authentication middleware
router.delete('/tasks/:id', auth, async (req, res) => {
    
    // get id
    const _id = req.params.id;

    // try to
    try {

        // get the task by id, user id (verify user created the task) and delete
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        });

        // task not found: 404
        if (!task) {
            return res.status(404).send();
        }

        // task found and deleted: 200
        res.status(200).send(task);

    } catch (err) {
        // error on request: 500
        res.status(500).send();
    }

});

// export the task router to register on the main Express app
module.exports = router;