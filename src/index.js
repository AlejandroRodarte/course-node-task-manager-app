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
app.get('/users', (req, res) => {

    // User.find() to make a query on the 'users' document
    // empty query object forces to fetch all documents from database
    // 500: Internal Server Error
    User
        .find({})
        .then(users => res.status(200).send(users))
        .catch(err => res.status(500).send(err));


});

// GET /users/:id: fetch a user by its id
// :id allows to catch the 'id' dynamic path variable
app.get('/users/:id', (req, res) => {

    // req.params stores all path variables from the incoming route
    // so we access the id from it
    const _id = req.params.id;

    // use findById() to directly inject the _id path variable and make the query
    // Mongoose automatically converts the String _id into its raw binary form
    User
        .findById(_id)
        .then(user => {

            // if a user was not found (null), send a 404 NOT FOUND
            if (!user) {
                return res.status(404).send('The user was not found');
            }

            // if it was found, send a 200 OK with the user object found
            res.status(200).send(user);

        })
        .catch(err => res.status(500).send(err));

});

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