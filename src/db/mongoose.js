const mongoose = require('mongoose');

// make mongoose connect to our MongoDB database name coming from the environment variable
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});