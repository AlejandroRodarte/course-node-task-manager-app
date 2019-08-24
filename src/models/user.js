const mongoose = require('mongoose');
const validator = require('validator');

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

// export the User model for other files to be able to create new users
module.exports = User;