const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const OrderSchema = new Schema({
  userCustomer: {
    type: String,
  },
  orderNumber: {
    type: String,
  },
  disneyProfiles: {
    type: Number,
  },
  hboProfiles: {
    type: Number,
  },
  primeProfiles: {
    type: Number,
  },
  paramountProfiles: {
    type: Number,
  },
  starProfiles: {
    type: Number,
  },
  months: {
    type: Number,
  },
  bank: {
    type: String,
  },
  imgURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
  pending: {
    type: Boolean,
    default: true
  },
  acepted: {
    tipe: Boolean,
    default: false,
  }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);