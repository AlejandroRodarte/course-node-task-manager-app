require('../src/db/mongoose');

const User = require('../src/models/user');

// findByIdAndUpdate(): find a document by id and update it
User
    .findByIdAndUpdate('5d616768ff0a131e2cb18931', {
        age: 1
    })
    .then(user => {

        console.log(user);

        // return a new Promise returned by countDocuments to find all documents that have an age field
        // equal to 1
        return User.countDocuments({
            age: 1
        });

    })
    .then(count => {
        // access then() from countDocuments() promise; log the result
        console.log(count);
    })
    .catch(err => {
        console.log(err);
    });