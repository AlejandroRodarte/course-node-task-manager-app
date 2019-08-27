const express = require('express');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// create a new multer.Instance
// dest: name of the folder where all the file uploads should be stored (/images)
const upload = multer({

    // destination path: /images
    dest: 'images',

    // limits: limit filezise to 1MB
    limits: {
        fileSize: 1000000
    },

    // fileFilter: define which files can be uploaded
    // req: the request object
    // file: the uploaded file object properties
    // cb: callback to determine what to do with upload
    fileFilter(req, file, cb) {

        // use regular expression to match .doc and .docx files
        // if they are not; use callback to return an Error and do not upload
        if (!file.originalname.match(/\.doc[x]{0,1}$/)) {
            return cb(new Error('Please upload a Word Document'));
        }

        // if file is a Word document, set the error to undefined and the second
        // boolean to true as a flag to proceed with download
        cb(undefined, true);

        // this silently ignores the upload; do not do this
        // cb(undefined, false);

    }

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