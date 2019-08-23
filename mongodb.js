// Mongo Client: allows us to connect to the database as clients
// ObjectID object to generate globally unique ID's using the module instead of the server generating them
const { MongoClient, ObjectID } = require('mongodb');

// connect to the MongoDB localhost server (using their protocol)
// recommended to type 127.0.0.1 instead of localhost
const connectionUrl = 'mongodb://127.0.0.1:27017';

// place any name to the database
const databaseName = 'task-app';

// use the client to connect to the database given the url
// also, explicitly inform we want to parse the url
// callback: code to run when the connection operation has finished (failed or success)
// receives injected the error and client objects for failed or successful connections
MongoClient.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error, client) => {

    if (error) {
        return console.log('Unable to connect to the database.');
    }

    console.log('Connected to the database.');

    // get a reference to the database we desire to manipulate
    // by picking a name and accessing it, MongoDB automatically creates the database
    // we also get a reference to the database from this db() method
    const db = client.db(databaseName);

    // findOne() to find the first query match (searching by name, but we can search by more fields)
    // the object passed in is a called a query object
    db.collection('users').findOne({
        name: 'Jen'
    }, (error, user) => {

        if (error) {
            console.log('Unable to fetch the user');
        }

        console.log(user);

    });

    // search by id: remember, MongoDB stores id's in their raw binary form
    // so we need to parse it from the 24-byte version to the 12-byte passing it as an argument to the ObjectID constructor
    db.collection('users').findOne({
        _id: new ObjectID('5d604cfba2c9ec33f89cba61')
    }, (error, user) => {

        if (error) {
            console.log('Unable to fetch the user');
        }

        console.log(user);

    });

    // find() to get all objects that match the query object criteria
    // a callback is not required, since we get back a cursor from this method, which is a pointer to the
    // matching data in the database
    // the reason for this is because we might not just want all the array of resulting objects, but
    // now other information such as the amount of matches

    // the toArray() method of the returned Cursor object is that one that really returns the array of matching data
    db.collection('users').find({
        age: 27
    }).toArray((error, users) => {
        console.log(users);
    });

    // instead of toArray(), we use count() to determine the amount of matches we have, we are not interested in the
    // data itself (we do not want to fetch it, just get the single count number back)
    db.collection('users').find({
        age: 27
    }).count((error, count) => {
        console.log(count);
    });

    // query a task based on id
    db.collection('tasks').findOne({
        _id: new ObjectID('5d604e2aaae4ec3ad019755c')
    }, (error, task) => {
        console.log(task);
    });

    // query all uncomplete tasks and fetch them completely
    db.collection('tasks').find({
        completed: false
    }).toArray((error, tasks) => {
        console.log(tasks);
    });

});