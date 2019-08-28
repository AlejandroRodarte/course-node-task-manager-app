const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userOne = {
    name: 'Alejandro Rodarte',
    email: 'alejandrorodarte1@gmail.com',
    password: 'guadalupana'
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
    await request(app)
            .post('/users')
            .send({
                name: 'Patricia Mendoza',
                email: 'pedosvacacow@hotmail.com',
                password: 'guadalupana'
            })
            .expect(201);
    
});

// login existing user
test('Should login existing user.', async () => {

    // make a POST /users/login request and send good credentials
    // expect a 200 http status code
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
            .expect(200);

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