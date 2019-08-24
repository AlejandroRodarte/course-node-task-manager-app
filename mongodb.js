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

    // deleteMany(): delete multiple documents that match the search criteria
    db
        .collection('users')
        .deleteMany({
            age: 27
        })
        .then(result => console.log(result))
        .catch(error => console.log(error));


    // deleteOne(): delete a single document based on search criteria
    db
        .collection('tasks')
        .deleteOne({
            task: 'Wash the dishes'
        })
        .then(result => console.log(result))
        .catch(error => console.log(error));

});