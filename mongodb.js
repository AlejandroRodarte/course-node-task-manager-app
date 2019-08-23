const mongodb = require('mongodb');

// Mongo Client: allows us to connect to the database as clients
const MongoClient = mongodb.MongoClient;

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

    // create collection named 'users' (table)
    // also, insert a document (record) with some data
    db.collection('users').insertOne({
        name: 'Andrew',
        age: 27
    });

});