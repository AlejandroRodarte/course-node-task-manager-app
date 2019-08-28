const sgMail = require('@sendgrid/mail');

// set the api key through the environment variable for development
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// send a welcome email
const sendWelcomeEmail = (email, name) => {
    
    // use send() to inform who sends the email, who receives it, the email title and body
    sgMail.send({
        to: email,
        from: 'alejandrorodarte1@gmail.com',
        subject: `Thanks for joining in ${name}!`,
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
    
};

// cancelation email
const sendCancelationEmail = (email, name) => {

    // send an email with a title and body pertaining to why the user cancelled
    sgMail.send({
        to: email,
        from: 'alejandrorodarte1@gmail.com',
        subject: `It's sad to see you go ${name}!`,
        text: `Thanks for being a client of our application ${name}. Please respond with any improvements we could have made to improve your user experience.`
    });

}

// export the functions
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};