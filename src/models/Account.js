const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountSchema = new Schema({
  typeCode: {
    type: String,
    required: [true, 'Por favor ingrese su tipo de documento'],
  },
  name: {
    type: String,
    required: [true, 'Por favor ingrese su nombre'],
  },
  price: {
    type: Number,
    required: [true, 'Por favor ingrese su precio'],
  },
  image: {
    type: String,
    required: [true, 'Por favor ingrese una imagen'],
  },
  sizeX: {
    type: Number,
    required: [true, 'Por favor ingrese un size X'],
  },
  sizeY: {
    type: Number,
    required: [true, 'Por favor ingrese un size Y'],
  },
}, {strict: true});

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);