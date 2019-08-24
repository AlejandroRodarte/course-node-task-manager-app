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

    // updateOne(): update just one document
    // we require the regular query object to make the match
    // and pass in an object with a $set property, which is an object which accepts the data
    // we want to update to that found record
    // since no callback was provided, the overloaded method returns a Promsie to access resolved/rejected data
    db
        .collection('users')
        .updateOne({
            _id: new ObjectID('5d604b0d71bf731c7464b5bd')
        }, {
            $set: {
                name: 'Alejandro'
            }
        })
        .then(result => console.log(result))
        .catch(error => console.log(error));
    
    // now using updateMany(), it works exactly the same as updateOne()
    db
        .collection('tasks')
        .updateMany({
            completed: false
        }, {
            $set: {
                completed: true
            }
        })
        .then(result => console.log(result))
        .catch(error => console.log(error));
        

});