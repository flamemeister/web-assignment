const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Book = require('./models/bookModel');
const multer = require('multer');
const Author = require('./models/authorModel');
const Genre = require('./models/genreModel');
const bookRouter = require('./routes/bookRouter')(Book, Author, Genre);  
const fileRouter = require('./routes/fileRouter')(Book, multer({ dest: 'uploads/' })); 


const app = express();

mongoose.connect('mongodb://localhost:27017/bookApp', { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', bookRouter);
app.use('/api/file', fileRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my Nodemon API!!');
});

const server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

module.exports = server;
