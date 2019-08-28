// import the fully configured Express app
const app = require('./app');

// use the Heroku assigned port, if not, port 3000 for development (through environment variable)
const port = process.env.PORT;

// deploy server on final port
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});