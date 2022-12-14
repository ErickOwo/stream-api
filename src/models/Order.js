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
  netflixProfiles: {
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
  accepted: {
    tipe: Boolean,
    default: false,
  },
  total: {
    type: Number,
  },
  active: {
    tipe: Boolean,
    default: false,
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);