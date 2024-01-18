const mongoose = require('mongoose');

const { Schema } = mongoose;

const genreModel = new Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('Genre', genreModel);
