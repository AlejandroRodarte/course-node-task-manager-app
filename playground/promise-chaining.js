require('../src/db/mongoose');

const User = require('../src/models/user');

// translating async code to use async/await
// 1. ALWAYS create a new asynf function
const updateAgeAndCount = async (id, age) => {

    // first async task: find user by id and update its age
    const user = await User.findByIdAndUpdate(id, {
        age
    });

    // first async task finished: second async task: count documents with the age argument
    const count = await User.countDocuments({
        age
    });

    // return the Promise that resolved this awaited count
    return count;

};

// 2. Use the async function to get the fully resolved data or an error if it happends in any 
// of the 'await' Promises
updateAgeAndCount('5d616768ff0a131e2cb18931', 30)
    .then(count => {
        console.log(count);
    })
    .catch(err => {
        console.log(err);
    });