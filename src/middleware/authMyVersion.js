const User = require('../models/user');
const bcrypt = require('bcryptjs');

// POST /users
// POST /users/login
const authMyVersion = async (req, res, next) => {

    // Postman returns an encoded text of the basic authentication provided through their application
    // it comes in this format: Basic cGF0eUBnbWFpbC5jb206Z3VhZGFsdXBhbmE=
    // where the encoded part, when decoded represents plain text in the format of email:password
    // all this comes in a header under the name of 'authorization'
    
    // in this first step, we separate split the 'Basic' word from the actual encoded segment
    const firstSplit = req.headers.authorization.split(' ');

    // the second element of the previous array contains the encoded email:password data, so we use
    // the Buffer.from() method to decode the text and parse it to a string
    const emailAndPassword = Buffer.from(firstSplit[1], 'base64').toString();

    // right now, the final text we have is in the format of email:password
    // we require access to each variable individually so we split them by the ':' character
    const emailAndPasswordArr = emailAndPassword.split(':');

    // we store the email and password in their respective variables
    const email = emailAndPasswordArr[0];
    const password = emailAndPasswordArr[1];

    // now, we attempt to find the user through the given email
    const user = await User.findOne({ email });

    // first check: does the user exist? if not, throw a 401 Unauthorized error
    if (!user) {
        return res.status(401).send('User is not authenticated. Please check your credentials.');
    }

    // user was found: compare the given password with the one on the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // second check: passwords do not match, throw a 401 unauthorized error
    if (!isPasswordValid) {
        return res.status(401).send('User is not authenticated. Please check your credentials.');
    }

    // passwords match: get now the token provided by the user
    const requestToken = req.headers.token;

    // some() method allows to check if the token provided by the client matches any of the tokens in the tokens array
    const isTokenPresent = user.tokens.some(token => requestToken === token.token);

    // third check: the given token was not found on the list of tokens for that user
    // return a 404 unauthorized error
    if (!isTokenPresent) {
        return res.status(401).send('User is not authenticated. Please check your credentials.');
    }

    // happy path: user was found, passwords match and token exists, call next middleware or route handler
    next();

}

// export the middleware
module.exports = authMyVersion;