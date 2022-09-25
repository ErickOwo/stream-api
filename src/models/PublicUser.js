const mongoose = require('mongoose');

const publicUserSchema = mongoose.Schema({
  name: {
    type: String, 
    required: true,
  },
  email: {
    type: String, 
    required: true,
  },
  phone: {
    type: String, 
    required: true,
  },
  password: {
    type: String, 
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  country: {
    type: String,
    default: 'Guatemala'
  },
  platforms: {
    type: Array
  }
})

module.exports = mongoose.models.PublicUser || mongoose.model('PublicUser', publicUserSchema);