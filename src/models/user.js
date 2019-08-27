const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

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
        unique: true,
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
    },

    // to allow users to have multiple tokens (maybe one for their PC and other one for their mobile device), 
    // we make the 'tokens' property of this schema an array of sub-documents, where each document is a...
    tokens: [{

        // token of type String and needs to be required: this sub-document will have its own id
        token: {
            type: String,
            required: true
        }

    }],

    // avatar field: store binary data of the user's profile picture 
    avatar: {
        type: Buffer
    }

}, {
    // enable timestamps (createdAt and updatedAt)
    timestamps: true
});

// virtual relationships that relate the User model with other models
// virtual relationship data is not stored in the database
// OneToMany: One user, many tasks
// set a reference to the Task model
// localField: the primary key of the User model
// foreignField: the field of the other entity which holds a reference to the User model primary key, 
// which goes under the name of 'owner'
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// create a new method for a user instance: generateAuthToken()
// this can be seen as an instance method (non-static), which belongs to a User instance
// here, we need access to the 'this' binding provided by the caller which contains the user data
// so we do not use arrow functions
userSchema.methods.generateAuthToken = async function () {

    // access user instead of this for better understanding
    const user = this;

    // create the new token: place in the JWT payload the unique id identifier (parse to String)
    // and place a random secret key
    const token = jwt.sign({ _id: user._id.toString() }, 'alejandroRodarte');

    // append to the 'tokens' array the new token
    // note: for some reason in Mongoose to push new elements in an array you have to use concat()
    // even though push() might work
    user.tokens = user.tokens.concat({ token });

    // save changes
    await user.save();

    return token;

};

// toJSON instance method: implicitly run before stringifying an object
userSchema.methods.toJSON = function() {

    // get a JSON object from the user model (new reference)
    const user = this;
    const userObject = user.toObject();

    // delete the password and tokens properties; also delete the avatar binary data
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    // return filtered user object. JSON.stringify() will not contemplate deleted
    // properties (used by Express when sending a response)
    return userObject;

}

// create a new method for the User model: findByCredentials()
// this can be seen as static methods that belong to a 'User' class
userSchema.statics.findByCredentials = async (email, password) => {

    // find unique user by email
    const user = await User.findOne({ email });

    // user not found: throw error
    if (!user) {
        throw new Error('Unable to login.');
    }

    // compare given password and password on database
    const isAuthenticated = await bcrypt.compare(password, user.password);

    // password do not match: throw an error
    if (!isAuthenticated) {
        throw new Error('Unable to login.');
    }

    // passwords match: return user
    return user;

};

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

// pre-remove middleware: regular function since we require access to the user instance to delete
userSchema.pre('remove', async function (next) {

    const user = this;

    // deleteMany() and delete all tasks that match the user to delete id
    await Task.deleteMany({
        owner: user._id
    });
    
    next();

});

// define our model (object) for the user with data types
// a document (table) named 'users' is created at this point
const User = mongoose.model('User', userSchema);

// export the User model for other files to be able to create new users
module.exports = User;