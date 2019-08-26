const jwt = require('jsonwebtoken');
const User = require('../models/user');

// authentication middleware
const auth = async (req, res, next) => {

    // try to
    try {

        // get the token from the 'Authorization' header and remove the 'Bearer ' part
        const token = req.header('Authorization').replace('Bearer ', '');

        // decode the token body with the private key
        const decoded = jwt.verify(token, 'alejandroRodarte');

        // use the decoded body, which contains the user id, to find the id
        // the second query object property allows to search for the encoded token in the array of tokens
        // for that particular user
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        // user not found: throw error
        if (!user) {
            throw new Error();
        }

        // user found: attach to request journey a 'user' property with the user data
        // and call next middleware
        req.user = user;
        next();

    } catch (err) {
        res.status(401).send({
            error: 'Please authenticate'
        })
    }

};

module.exports = auth;