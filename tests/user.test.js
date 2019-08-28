const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

// the user id
const userOneId = new mongoose.Types.ObjectId();

// add the id to the user and a genereated token
const userOne = {
    _id: userOneId,
    name: 'Alejandro Rodarte',
    email: 'alejandrorodarte1@gmail.com',
    password: 'guadalupana',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

// code that runs BEFORE each test()
// delete ALL users in the testing database
// and persist a dummy user for testing purposes
beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

// code that runs AFTER each test()
afterEach(() => {
    console.log('afterEach() called');
});

test('Should sign up a new user.', async () => {

    // use the supertest function to pass in the Express app, assert a POST /users
    // http request, send a hardcoded request body and expect a 201 response status code
    // store the response body in a variable
    const response = 
        await request(app)
                .post('/users')
                .send({
                    name: 'Patricia Mendoza',
                    email: 'pedosvacacow@hotmail.com',
                    password: 'guadalupana'
                })
                .expect(201);

    // search the POSTed user in the database
    const user = await User.findById(response.body.user._id);

    // expect the fetched user to not be null (found user)
    expect(user).not.toBeNull();

    // expect the response mody to match the response object we set on toMatchObject()
    expect(response.body).toMatchObject({
        user: {
            name: 'Patricia Mendoza',
            email: 'pedosvacacow@hotmail.com'
        },
        token: user.tokens[0].token
    });

    // expect the user's password (hashed) to not match a plaintext password
    expect(user.pasword).not.toBe('guadalupana');
    
});

// login existing user
test('Should login existing user.', async () => {

    // make a POST /users/login request and send good credentials
    // expect a 200 http status code
    const response = 
        await request(app)
                .post('/users/login')
                .send({
                    email: userOne.email,
                    password: userOne.password
                })
                .expect(200);
    
    // get the logged in user from the database
    const user = await User.findById(userOneId);

    // expect that the token in the response body matches the SECOND token in the tokens array
    // of that user (he started with one token)
    expect(response.body.token).toBe(user.tokens[1].token);

});

// negate access to non existent user
test('Should not login non-existent user.', async () => {

    // make a POST /users/login request and send wrong credentials (password)
    // expect a 400 http status code
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: `${userOne.password}1`
            })
            .expect(400);

});

// get profile for user that is authenticated
test('Should get profile for user.', async () => {

    // test GET /users/me with the 'Authorization' header attached (this was done by Postman automatically)
    // and expect a 200 status OK
    await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);

});

// should not get a profile for a bad user
test('Should not get profile for unauthenticated user.', async () => {

    // test GET /users/me without sending an Authorization header, expect a 401
    await request(app)
            .get('/users/me')
            .send()
            .expect(401);

});

// should delete user account that is logged in
test('Should delete account for authenticated user.', async () => {

    // run DELETE /users/me with the Authorization header attached and a valid token
    // expect a 200
    const response = 
        await request(app)
                .delete('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
    
    // fetch the deleted user and expect such user to be null since it was deleted from the database
    const user = await User.findById(userOneId);
    expect(user).toBeNull();

});

// should not delete user account that does not provide a valid token
test('Should not delete account for unauthenticated user.', async () => {

    // test DELETE /users/me and do not send a token
    await request(app)
            .delete('/users/me')
            .send()
            .expect(401);

});