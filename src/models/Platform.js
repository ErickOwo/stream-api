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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Platform'
  }
},{strict:true});

module.exports = mongoose.models.Platform || mongoose.model('Platform', PlatformSchema);