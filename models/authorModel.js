
const mongoose = require('mongoose');

const { Schema } = mongoose;

const authorModel = new Schema({
  surname: { type: String, required: true, minlength: 2, maxlength: 30 },
  name: { type: String, required: true, minlength: 2, maxlength: 30 }
});

module.exports = mongoose.model('Author', authorModel);
