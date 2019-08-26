const jwt = require('jsonwebtoken');

const myFunction = async () => {

    // create a new authentication token
    // first arg: data embedded in the token
    // second argument: private key for the server to use for validation
    // so it knows that the client has not altered the JWT
    // third arg: options, we can set an expiration time for the JWT
    const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' });

    console.log(token);

    // validate JWT: provide a token to verify and the secret server key that was used
    // to create the original JWT
    const payload = jwt.verify(token, 'thisismynewcourse');

    console.log(payload);

};

myFunction();