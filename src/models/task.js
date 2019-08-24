const mongoose = require('mongoose');

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

// export the Task model for other files to access and create instances of it
module.exports = Task;