const express = require('express');
const PublicUser = require('../models/PublicUser');
const Order = require('../models/Order');
const Platform = require('../models/Platform');
const Profile = require('../models/Profile');

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

router.get('/profiles/:user', async (req, res)=>{
  const platform = await Profile.find({customerId: req.params.user})
    .populate('platformId',{
      title: 1,
      type: 1,
      email: 1,
      password: 1
    }, )
  res.send(platform);
})

module.exports = router; 