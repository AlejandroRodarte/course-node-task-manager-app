const mongoose = require('mongoose');

const connectionUrl = 'mongodb://127.0.0.1:27017/task-app-api';

// 1. make mongoose connect to our MongoDB database name
mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// define our model (object) for the user with data types
// a document (table) named 'users' is created at this point
const User = mongoose.model('User', {
    name: {
        type: String
    },
    age: {
        type: Number
    }
});

// define the Task model with data types
// a document (table) named 'tasks' is created at this point
const Task = mongoose.model('Task', {
    description: {
        type: String
    },
    completed: {
        type: Boolean
    }
});

// create a new instance of the User model
const user = new User({
    name: 'Patricia',
    age: 61
});

// use the save() method to persist the data
user
    .save()
    .then(() => console.log(user))
    .catch(error => console.log(error));


// create the Task model instance
const task = new Task({
    description: 'Wash the dishes',
    completed: false
});

// use the save() method to persist the data
task
    .save()
    .then(() => console.log(task))
    .catch(error => console.log(error));