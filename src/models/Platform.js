const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const PlatformSchema = new Schema({
  title: {
    type: String,
    required: [true, 'title required']
  },
  email: {
    type: String,
    required: [true, 'email required']
  },
  password: {
    type: String,
    required: [true, 'password required']
  },
  type: {
    type: Number,
    require: [true, 'type required']
  },
  customers: {
    type: Array
  }
});

module.exports = mongoose.models.Platform || mongoose.model('Platform', PlatformSchema);