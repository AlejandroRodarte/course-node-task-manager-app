const request = require('supertest');
const app = require('../src/app');

test('Should sign up a new user', async () => {

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