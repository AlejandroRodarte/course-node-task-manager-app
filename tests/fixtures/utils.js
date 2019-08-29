const request = require('supertest');

// GET response
const getResponse = (app, path, token) => {

    // stop at send() so we can apply expect() method outside
    return request(app)
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .send();

};

// get an array of fields from a particular response body
const getFields = (responseBody, field) => {
    const arr = [];
    responseBody.forEach(doc => arr.push(doc[field]));
    return arr;
}

module.exports = {
    getResponse,
    getFields
};