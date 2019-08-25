require('../src/db/mongoose');

const Task = require('../src/models/task');

// delete a task by their id and count amount of incomplete tasks
const deleteTaskAndCount = async (id) => {

    // first async: wait for database to find task by id and delete
    const task = await Task.findByIdAndDelete(id);

    // first async finished: second async triggers: count incomplete tasks
    const count = await Task.countDocuments({
        completed: false
    });

    // return Promise that resolved second async
    return count;

};

// call async function and use then() and catch() to log results
deleteTaskAndCount('5d6162938530482fb801c22d')
    .then(count => {
        console.log(count);
    })
    .catch(err => {
        console.log(err);
    });