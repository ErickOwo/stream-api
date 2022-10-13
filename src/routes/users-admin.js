const express = require('express');
const PublicUser = require('../models/PublicUser');
const Order = require('../models/Order');
const Platform = require('../models/Platform');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await PublicUser.find();
  return res.send(users);
})

router.get('/user/:user', async (req, res) => {
  const user = await PublicUser.findById(req.params.user);
  return res.send(user);
})

router.get('/orders/:user', async (req, res)=>{
  const order = await Order.find({userCustomer: req.params.user});
  res.send(order);
})

router.get('/platforms/:platform', async (req, res)=>{
  const platform = await Platform.findById(req.params.platform);
  res.send(platform);
})

module.exports = router; 