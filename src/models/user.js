const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// the user schema
const userSchema = new mongoose.Schema({

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

// pre-save middleware: note we are not using an arrow function since we require access
// to the 'this' value incoming from the called, which contains the user data to post/update
userSchema.pre('save', async function (next) {

    // get access to 'this' from the userSchema.pre() call, which is the user to save
    const user = this;

    // if the password was modified (either created or altered), we run the hashing algorithm
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    // call next middleware
    next();

});

// define our model (object) for the user with data types
// a document (table) named 'users' is created at this point
const User = mongoose.model('User', userSchema);

// export the User model for other files to be able to create new users
module.exports = User;