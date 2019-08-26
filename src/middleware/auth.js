const jwt = require('jsonwebtoken');
const User = require('../models/user');

// authentication middleware
const auth = async (req, res, next) => {

    // try to
    try {

        // get the token from the 'Authorization' header and remove the 'Bearer ' part
        const token = req.header('Authorization').replace('Bearer ', '');

        // decode the token body with the private key
        // verify() also checks that the token has not expired yet
        const decoded = jwt.verify(token, 'alejandroRodarte');

        // use the decoded body, which contains the user id, to find the id
        // the second query object property allows to search for the encoded token in the array of tokens
        // for that particular user (this works during logout when we remove the token from the database)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        // user not found: throw error
        if (!user) {
            throw new Error();
        }

        // user found: attach to request journey a 'user' property with the user data
        // and call next middleware
        req.user = user;

        // also attach the token in the current request
        req.token = token;

        next();

    } catch (err) {
        res.status(401).send({
            error: 'Please authenticate'
        })
    }

};

module.exports = auth;