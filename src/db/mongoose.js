const mongoose = require('mongoose');
const validator = require('validator');

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

    // user name: String, required field and sanitize by trimming all spaces
    name: {
        type: String,
        required: true,
        trim: true
    },

    // user email: String, required field, trim all excessive spaces, make lowercase
    // and use isEmail() validator to check if final, parsed email is correct
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please provide a valid email.');
            }
        }
    },

    // user age; Number, if not provided, default to 0, validate custom method that checks
    // for negative ages
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.');
            }
        }
    },

    // password; String, required field, min length of 6, trim all white spaces and check if the
    // word 'password' does not exist on the final trimmed and lowercased String
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().indexOf('password') !== -1) {
                throw new Error('Password must not have the word \'password\' on it.')
            }
        }
    }

});

// define the Task model with data types
// a document (table) named 'tasks' is created at this point
const Task = mongoose.model('Task', {

    // description: String, required field and trim white spaces
    description: {
        type: String,
        required: true,
        trim: true
    },

    // completed: Boolean and if not provided, default to false
    completed: {
        type: Boolean,
        default: false
    }

});

// create a new instance of the User model
// const user = new User({
//     name: '    Andrew    ',
//     email: 'myemail@mead.io   ',
//     password: 'phone098!'
// });

// use the save() method to persist the data
// user
//     .save()
//     .then(() => console.log(user))
//     .catch(error => console.log(error));

// create the Task model instance
const task = new Task({
    description: '     Walk the god     ',
    completed: true
});

// use the save() method to persist the data
task
    .save()
    .then(() => console.log(task))
    .catch(error => console.log(error));