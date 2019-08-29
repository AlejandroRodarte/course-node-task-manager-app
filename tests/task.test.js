const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { getResponse, getFields } = require('./fixtures/utils');
const { userOne, userTwo, taskOne, taskTwo, 
        taskThree, taskFour, taskFive, taskSix, 
        taskSeven, taskEight, initDatabase } = require('./fixtures/db');

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
    expect(response.body.length).toBe(4);

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

test('Should not create task with invalid description/completed.', async () => {

    // POST /tasks with no 'description' in request body, expecting a 400 status code
    await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                completed: true
            })
            .expect(400);

});

test('Should not update task with invalid description/completed.', async () => {

    // PATCH /tasks/:id with auth token but setting an empty 'description' field, failing validation
    // and expecting a 400 status code
    await request(app)
            .patch(`/tasks/${taskFour._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send({
                description: '',
                completed: true
            })
            .expect(400);
    
    // verify that the task that we desired to update did not change in the database
    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe(taskOne.description);

});

test('Should delete user task.', async () => {

    // DELETE /tasks/:id with auth token, expecting a 200 status code
    await request(app)
            .delete(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(200);
    
    // verify that the task has been properly deleted in the database
    const task = await Task.findById(taskThree._id);
    expect(task).toBeNull();

});

test('Should not delete task if unauthenticated.', async () => {

    // DELETE /tasks/:id without auth token, expecting a 401 status code
    await request(app)
            .delete(`/tasks/${taskTwo._id}`)
            .send()
            .expect(401);
    
    // verify that the given task has not been deleted in the database
    const task = await Task.findById(taskTwo._id);
    expect(task).not.toBeNull();

});

test('Should not update other users task.', async () => {

    // PATCH /tasks/:id on a task made by userTwo but auth token from userOne,
    // expecting a 404 status code
    await request(app)
            .patch(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                completed: true
            })
            .expect(404);
    
    // verify in the database that the property that was attempted to be updated did not
    // update and kept it's original value
    const task = await Task.findById(taskThree._id);
    expect(task.completed).toBe(false);

});

test('Should fetch user task by id.', async () => {

    // GET /tasks:id of a task made by userOne and with auth token from userOne, expecting
    // a 200 status code
    const response = 
        await request(app)
                .get(`/tasks/${taskTwo._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
    
    // verify that the fetched task id matches the one we queried
    expect(response.body._id).toBe(taskTwo._id.toHexString());

});

test('Should not fetch user task by id if unauthenticated.', async () => {

    // GET /tasks/:id without auth token, expect 401 status code
    await request(app)
            .get(`/tasks/${taskThree._id}`)
            .send()
            .expect(401);

});

test('Should not fetch other users task by id.', async () => {

    // GET /tasks/:id of a task made by userTwo and an auth token from userOne,
    // so expect a 404 status code
    await request(app)
            .get(`/tasks/${taskThree._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(404);

});

test('Should fetch only completed tasks.', async () => {

    // GET /tasks?completed=true with auth token from userOne, expect a regular 200 status code
    const response = 
        await request(app)
                .get('/tasks?completed=true')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
    
    // our sample data contains a total of 2 complete tasks for userOne
    expect(response.body.length).toBe(2);

});

test('Should fetch only incomplete tasks.', async () => {

    // GET /tasks?completed=false with auth token from userTwo, expect a regular 200 status code
    const response = 
        await request(app)
                .get('/tasks?completed=false')
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send()
                .expect(200);
    
    // our sample data contains a total of 2 complete tasks for userTwo
    expect(response.body.length).toBe(2);

});

test('Should sort tasks by description/completed/createdAt/updatedAt.', async () => {

    // this was a pain since we need to test all the four task fields with their two possible orders (asc or desc)
    // so we create a reassignable response variable to make several requests and a 'fields' variable that we will
    // use to know if the expected array matches the one we get from the response
    let response;
    let fields;

    // 1. check ascendant order of userOne tasks by description; expect a 200 from the GET request
    // use the response body (array of tasks) to create an array of the task descriptions, which should match
    // the static order provided
    response = await getResponse(app, '/tasks?sortBy=description:asc', userOne.tokens[0].token).expect(200); 
    fields = getFields(response.body, 'description');
    expect(fields).toEqual(['Complete Angular course', 'Complete GraphQL course', 'Complete Node.js course', 'Complete Typescript course']);
    
    // 2. do the same but now with userTwo tasks un descendant order
    response = await getResponse(app, '/tasks?sortBy=description:desc', userTwo.tokens[0].token).expect(200); 
    fields = getFields(response.body, 'description');
    expect(fields).toEqual(['Wash the dishes', 'Walk the dog', 'Put gas in the car', 'Clean the windows']);
    
    // 3. do the same but now with the 'completed' boolean of userTwo tasks; since we have four tasks total, two incomplete
    // and two complete, we expect the incomplete ones appear first
    response = await getResponse(app, '/tasks?sortBy=completed:asc', userTwo.tokens[0].token).expect(200); 
    fields = getFields(response.body, 'completed');
    expect(fields).toEqual([false, false, true, true]);
    
    // 4. do the same but now with the incomplete tasks of userOne
    response = await getResponse(app, '/tasks?sortBy=completed:desc', userOne.tokens[0].token).expect(200); 
    fields = getFields(response.body, 'completed');
    expect(fields).toEqual([true, true, false, false]);

    // 5. do the same with the createdAt field in ascendant order (oldest to newest); on the database initialization code
    // we persisted the tasks from taskOne to taskEight in ascendant order
    // tasks by userOne are taskOne, taskTwo, taskFive and taskSix
    // thus, taskOne should be the oldest one and taskSix the newest one
    // we capture the _id fields from the response body to verify this assertion
    response = await getResponse(app, '/tasks?sortBy=createdAt:asc', userOne.tokens[0].token).expect(200); 
    fields = getFields(response.body, '_id');
    expect(fields).toEqual([taskOne._id.toHexString(), taskTwo._id.toHexString(), taskFive._id.toHexString(), taskSix._id.toHexString()]);
    
    // 6. do the same with userTwo tasks but from newest to oldest
    response = await getResponse(app, '/tasks?sortBy=createdAt:desc', userTwo.tokens[0].token).expect(200); 
    fields = getFields(response.body, '_id');
    expect(fields).toEqual([taskEight._id.toHexString(), taskSeven._id.toHexString(), taskFour._id.toHexString(), taskThree._id.toHexString()]);

    // update taskTwo and taskSeven to verify further the functionality of the updatedAt sorting
    await request(app)
            .patch(`/tasks/${taskTwo._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                completed: false
            })
            .expect(200);

    await request(app)
            .patch(`/tasks/${taskSeven._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send({
                completed: true
            })
            .expect(200);
    
    // 7. do the same but with the updatedAt field in ascendant order of userTwo tasks (oldest to newest)
    // the 'newest' date comes from taskSeven since it was the one that got updated, so it goes last
    // while the other three tasks go in the order they were created
    response = await getResponse(app, '/tasks?sortBy=updatedAt:asc', userTwo.tokens[0].token).expect(200); 
    fields = getFields(response.body, '_id');
    expect(fields).toEqual([taskThree._id.toHexString(), taskFour._id.toHexString(), taskEight._id.toHexString(), taskSeven._id.toHexString()]);
    
    // 8. do the same but with from the newest to the oldest update for userOne tasks
    // taskTwo has the 'newest' date since it got updated, so it goes first
    // while the other three tasks go in the reverse order in when they were created
    response = await getResponse(app, '/tasks?sortBy=updatedAt:desc', userOne.tokens[0].token).expect(200); 
    fields = getFields(response.body, '_id');
    expect(fields).toEqual([taskTwo._id.toHexString(), taskSix._id.toHexString(), taskFive._id.toHexString(), taskOne._id.toHexString()]);

});

test('Should fetch page of tasks.', async () => {

    // GET /tasks?completed=true&limit=2&skip=1 with auth token from userOne, expect a regular 200 status code
    const response = 
        await request(app)
                .get('/tasks?completed=true&limit=2&skip=1')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
        
    // the total completed tasks for userOne are 2, but since we skipped 1 through the query param,
    // we expect just one task in the page
    expect(response.body.length).toBe(1);

    // the 2nd complete task for userOne should be taskSix
    expect(response.body[0]._id).toBe(taskSix._id.toHexString());

});