const mongoose = require('mongoose');
const connectionUrl = 'mongodb://127.0.0.1:27017/task-app-api';

// make mongoose connect to our MongoDB database name
mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});