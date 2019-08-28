// mock functions for @sendgrid/mail library
// create mocks of setApiKey() and send() so they do not actually send emails when running the tests
module.exports = {
    setApiKey() {

    },
    send() {

    }
};