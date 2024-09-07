const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const port = 3000;

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure 'uploads' directory exists
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Use the original name of the file
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize Multer with storage configuration
const upload = multer({ storage: storage });

// Define routes
app.post('/upload', upload.single('image'), (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Respond with success
    res.send(`File uploaded successfully: ${req.file.filename}`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
