require('../src/db/mongoose');

const Task = require('../src/models/task');
const User = require('../src/models/user');

// 1. find the user that created a task
const findUserByTask = async () => {

    // 2. find the task by id
    const task = await Task.findById('5d63fe4ac699893854f2c995');

    // 3. populate the task instance with a User object by finding
    // the user through the user id found as a foreign key on the task's 
    // 'owner' field
    await task.populate('owner').execPopulate();

    console.log(task.owner);

};

// 1. find tasks given a user
const findTasksByUser = async () => {

    // 2. find the user by id
    const user = await User.findById('5d63fd8b1a1c912a044838a2');

    // 3. populate the user instance's 'tasks' virtual field with all Task
    // documents that match the user's _id (config provided on the user schema)
    await user.populate('tasks').execPopulate();

    console.log(user.tasks);

}

findUserByTask();
findTasksByUser();