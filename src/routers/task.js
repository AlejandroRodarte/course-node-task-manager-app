const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');

// create a new router for task endpoints
const router = new express.Router();

// GET /tasks: fetch all tasks
// make callback an async function
router.get('/tasks', async (req, res) => {

    // try to fetch all tasks
    // success: 200
    // fail: 500
    try {
        const tasks = await Task.find({});
        res.status(200).send(tasks);
    } catch (err) {
        res.status(500).send(err)
    }

});

// GET /tasks/:id: fetch a task by its id
// make callback async
router.get('/tasks/:id', async (req, res) => {

    // capture the id path variable
    const _id = req.params.id;

    // try to get the task by its id
    try {

        const task = await Task.findById(_id);

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
router.patch('/tasks/:id', async (req, res) => {

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
        // 1. findById()
        const task = await Task.findById(_id);

        // 2. update manually each property
        updates.forEach(update => {
            task[update] = req.body[update];
        });

        // 3. use save() to actually trigger the middleware
        await task.save();

        // no task was found: 404
        if (!task) {
            return res.status(404).send({
                error: 'No task was found.'
            });
        }

        // happy path: 200
        res.status(200).send(task);

    } catch (err) {
        // error on request (by server or validation): 400 (for now)
        res.status(400).send(err)
    }

});

// DELETE /tasks/:id: delete a task based on its id
router.delete('/tasks/:id', async (req, res) => {
    
    // get id
    const _id = req.params.id;

    // try to
    try {

        // get the task by id and delete
        const task = await Task.findByIdAndDelete(_id);

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