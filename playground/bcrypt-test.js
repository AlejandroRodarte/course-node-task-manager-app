const bcrypt = require('bcryptjs');

const myFunction = async () => {

    // plaintext password
    const password = 'red12345!';

    // create hashed password (to store)
    // 8 rounds is a good amount
    const hashedPassword = await bcrypt.hash(password, 8);

    console.log(password);
    console.log(hashedPassword);

    const isMatch = await bcrypt.compare('Red12345!', hashedPassword);
    console.log(isMatch);

    // return Promise
    return hashedPassword;

};

myFunction();