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

// deploy server on final port
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});