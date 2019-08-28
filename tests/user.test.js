const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, initDatabase } = require('./fixtures/db');

// code that runs BEFORE each test()
// initialize the database
beforeEach(initDatabase);

// code that runs AFTER each test()
// afterEach(() => {
//     console.log('afterEach() called');
// });

// test the sign up a new user
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

// test uploading avatar images on authenticated users
test('Should upload avatar image.', async () => {

    // POST /users/me/avatar and send token as a header
    // use attach() to attach a file as a key/value pair just as we did with Postman
    // expect a 201 CREATED response
    await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(201);
    
    // get the user from the database and check the its binary data is equal to a Buffer type
    // we use toEqual() since we are comparing objects and use expect.any() to not match value, but
    // a data type
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));

});

// test that user fields have been updated
test('Should update valid user fields.', async () => {

    // PATCH /users/me and set authorization header,
    // send an update to the name and expect a 200 OK response
    await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                name: 'Patricia Mendoza'
            })
            .expect(200);
    
    // get the user from the database and match the update user name with the name we provided hardcoded
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Patricia Mendoza');

});

// test that PATCH /users/me does not update invalid fields
test('Should not update invalid user fields.', async () => {

    // make the request with authorization and expect a 400 response
    await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                location: 'Chihuahua'
            })
            .expect(400);

});