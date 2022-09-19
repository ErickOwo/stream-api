const Joi = require('@hapi/joi');

// user schemas 
const schemaRegisterUser = Joi.object({
  name: Joi.string().min(3).max(460).required(),
  email: Joi.string().min(6).max(260).required().email(),
  phone: Joi.string().min(8).max(60).required(),
  password: Joi.string().min(8).max(2048).required(),
});
const schemaLoginUser = Joi.object({
  email: Joi.string().min(6).max(260).required().email(),
  password: Joi.string().min(8).max(2048).required(),
});

// admin schemas
const schemaRegisterAdmin = Joi.object({
  name: Joi.string().min(3).max(460).required(),
  email: Joi.string().min(6).max(260).required().email(),
  creator: Joi.string().min(6).max(260).required().email(),
  phone: Joi.string().min(8).max(60).required(),
  password: Joi.string().min(8).max(2048).required(),
});
const schemaLoginAdmin = Joi.object({
  email: Joi.string().max(260).required().email(),
  password: Joi.string().max(2048).required(),
});

// orders schemas
const schemaOrders = Joi.object({
  user: Joi.required(),
  orderNumber: Joi.string().min(1).max(180).required(),
  disneyProfiles: Joi.number().required(),
  hboProfiles: Joi.number().required(),
  primeProfiles: Joi.number().required(),
  paramountProfiles: Joi.number().required(),
  starProfiles: Joi.number().required(),
  months: Joi.number().required(),
  bankCode: Joi.number().required(),
});

module.exports = {
  schemaRegisterUser,
  schemaLoginUser,
  schemaRegisterAdmin,
  schemaLoginAdmin,
  schemaOrders,
}

