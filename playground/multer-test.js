const express = require('express');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// create a new multer.Instance
// dest: name of the folder where all the file uploads should be stored (/images)
const upload = multer({
    dest: 'images'
});

// create a new endpoint for the user to store these files
// upload.single() middleware: store a single file with the name of 'upload'
// basically, look for a file named 'upload' when the request comes in
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
});

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});