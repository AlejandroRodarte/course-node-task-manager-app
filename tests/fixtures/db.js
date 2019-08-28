// database test environment code
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

// the id's for user one and two
const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

// add the id to the user and a genereated token
const userOne = {
    _id: userOneId,
    name: 'Alejandro Rodarte',
    email: 'alejandrorodarte1@gmail.com',
    password: 'guadalupana',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

// same info for the second user
const userTwo = {
    _id: userTwoId,
    name: 'Patricia Mendoza',
    email: 'pedosvacacow@gmail.com',
    password: 'guadalupana',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

// four hardcoded tasks to test on the two users we have
const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Complete Node.js course',
    completed: false,
    owner: userOne._id
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Complete Angular course',
    completed: true,
    owner: userOne._id
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Wash the dishes',
    completed: false,
    owner: userTwo._id
};

const taskFour = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Put gas in the car',
    completed: true,
    owner: userTwo._id
};

// initialize the database
// delete ALL users and tasks in the testing database
// add all the two users and four tasks we have to test our routes
const initDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
    await new Task(taskFour).save();
};

// export everything!
module.exports = {
    userOneId,
    userOne,
    userTwo,
    taskOne,
    initDatabase
}