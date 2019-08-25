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

// POST /users: create a new user
app.post('/users', (req, res) => {

    // use the request body parsed as JSON to create a new user
    const user = new User(req.body);

    // save the user through Mongoose
    // if failure exists: set status code to 400 and respond with error
    // 201: Success (object created)
    // 400: Client error (malformed body)
    user
        .save()
        .then(() => {
            res.status(201);
            res.send(user);
        })
        .catch((err) => {
            res.status(400);
            res.send(err);
        });

});

// POST /tasks: create a new task and persist
app.post('/tasks', (req, res) => {

    // create a new task model instance
    const task = new Task(req.body);

    // persist to database and manage errors by setting a correct status code
    task
        .save()
        .then(() => {
            res.status(201);
            res.send(task);
        })
        .catch((err) => {
            res.status(400);
            res.send(err);
        });

});

// deploy server on final port
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});