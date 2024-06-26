// models.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  email: String,
  name: String
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
