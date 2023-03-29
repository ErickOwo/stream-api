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
  },
  idRecover: {
    type: String,
    default: null
  },
  dateRecover: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.models.PublicUser || mongoose.model('PublicUser', publicUserSchema);