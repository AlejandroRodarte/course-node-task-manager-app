const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userTwo, taskOne, initDatabase } = require('./fixtures/db');

// before running tests: initialize database
beforeEach(initDatabase);

// test: create a new task for a logged in user
test('Should create task for user', async () => {

    // POST /tasks with bearer token, send task information and expect a 201
    const response = 
        await request(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    description: 'Complete Node.js course',
                    completed: false
                })
                .expect(201);
    
    // get the task from the database through the response's body and expect it to not be null
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();

    // expect the uploaded task completion to be false
    expect(task.completed).toBe(false);

});

// test that checks that we get the correct amount of tasks for a hardcoded user
test('Should get the correct amount of tasks for a logged in user.', async () => {

    // GET /tasks, send auth token and expect a 200, we get a response body which holds an array
    // of task objects
    const response =
        await request(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
    
    // check that we get in the response body (array of tasks) two tasks related to that user
    expect(response.body.length).toBe(2);

});

// test that user two can't delete a task created by user one
test('Should not delete task of a user that does now own it.', async () => {

    // DELETE /tasks with the task one id (created by user one)
    // set authorization to identify user two,
    // since user two did not create task one, expect 404
    await request(app)
            .delete(`/tasks/${taskOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404);
    
    // get the task from the database and check that is has not been deleted (not null)
    const task = Task.findById(taskOne._id);
    expect(task).not.toBeNull();

});