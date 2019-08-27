const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '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';

// 1. set the api key
sgMail.setApiKey(sendgridAPIKey);

// use send() to inform who sends the email, who receives it, the email title and body
sgMail.send({
    to: 'alejandrorodarte1@gmail.com',
    from: 'alejandrorodarte1@gmail.com',
    subject: 'Hello from Node.js',
    text: 'I hope this one actually gets to you'
});