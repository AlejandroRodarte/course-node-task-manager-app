require('../src/db/mongoose');

const Task = require('../src/models/task');

// first async task: findByIdAndDelete
Task
    .findByIdAndDelete('5d61cdcc83eb9a412ce4ee3f')
    .then(() => {
        // success first async task: execute second async task: countDocuments
        return Task.countDocuments({
            completed: false
        });
    })
    .then(count => {
        // success second async task: log amount of not completed tasks
        console.log(count);
    })
    .catch(err => {
        console.log(err);
    });