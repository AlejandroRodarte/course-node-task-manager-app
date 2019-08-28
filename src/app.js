// use express
const express = require('express');

// run mongoose.js file to connect mongoose to MongoDB database
require('./db/mongoose');

// import the user router
const userRouter = require('./routers/user');

// import the task router
const taskRouter = require('./routers/task');

// run express method to start up Express
const app = express();

// parse all request/response body to JSON
app.use(express.json());

// register the user router
app.use(userRouter);

// register the task router
app.use(taskRouter);

// export the Express app
module.exports = app;