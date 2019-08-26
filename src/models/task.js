const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

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
    },

    // each task will store its author's ObjectId
    // 'ref': allows to reference the 'User' model id to this field (foreign key)
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

}, {
    // enable timestamps (createdAt and updatedAt)
    timestamps: true
});

// define the Task model with data types
// a document (table) named 'tasks' is created at this point
const Task = mongoose.model('Task', taskSchema);

// export the Task model for other files to access and create instances of it
module.exports = Task;