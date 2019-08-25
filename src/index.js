const express = require('express');

// run mongoose.js file to connect mongoose to MongoDB database
require('./db/mongoose');

// import the models
const User = require('./models/user');
const Task = require('./models/task');

// run express method to start up Express
const app = express();

// use the Heroku assigned port, if not, port 3000 for development
const port = process.env.PORT || 3000;

// parse all request/response body to JSON
app.use(express.json());

// GET /users: fetch all users
// make callback async
app.get('/users', async (req, res) => {

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
app.get('/users/:id', async (req, res) => {

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
app.post('/users', async (req, res) => {

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
app.patch('/users/:id', async (req, res) => {

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

        // new: true -> returns the new document with the updated data
        // runValidators: true -> runs validators when attempting to update the data
        const user = await User.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        });

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

// GET /tasks: fetch all tasks
// make callback an async function
app.get('/tasks', async (req, res) => {

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
app.get('/tasks/:id', async (req, res) => {

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
app.post('/tasks', async (req, res) => {

    // create a new task model instance
    const task = new Task(req.body);

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
app.patch('/tasks/:id', async (req, res) => {

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

        // find a task by its id and update using the request body
        // we want the updated task data and run validators on new data
        const task = await Task.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        });

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

// deploy server on final port
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});