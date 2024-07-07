const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ProfileSchema = new Schema({
  alias: {
    type: String,
    default: null
  },
  platformId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Platform'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser'
  }
}, {strict: true});

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);