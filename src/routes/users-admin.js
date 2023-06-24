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
  const orders = await Order.find()
  ordersClear = orders.filter(order => order.userCustomer == req.params.user)
  res.send(ordersClear);
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

router.post('/users/changedatauser/:id_user', async (req, res) =>{
  try {
    const {id_user} = req.params;
    let idRecover = uuidv4()
    idChangeData = idRecover.replaceAll('-', `123`)

    const userSaved = await PublicUser.findByIdAndUpdate(id_user, {
      idChangeData,
    }, {
      new: true,
      runValidators: true,
    })
    
    const info = `Que tal, ${userSaved} Te invitamos a crear tu usuario en la plataforma de stream-play.vercel.app/filluserinfo/${idChangeData}`

    return res.send({text: info, type:'success'})
  } catch(error) {
    return res.status(400).json(error);
  } 
})

module.exports = router; 