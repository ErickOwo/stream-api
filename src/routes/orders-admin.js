const express = require('express');
const wbm = require('../utils/wbm');
const router = express.Router();

// models
const Order = require('../models/Order');
const PublicUser = require('../models/PublicUser');
const Platform = require('../models/Platform')

router.get('/pending', async (req, res) => {
  const orders = await Order.find({pending: true});
  res.json(orders)
})

const { addImage, deleteImage } = require('../utils/use-media');

router.put('/', async (req, res) => {
  try {  
    
    const { platforms, user, order, startDate, endDate } = req.body;

    let userSaved = await PublicUser.findById(user._id);
  
    if(!userSaved) res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})

    if(!( userSaved._id == user._id 
       && userSaved.name == user.name 
       && userSaved.email == user.email)){
      return res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})
    }

    if(userSaved.platforms) userSaved = await PublicUser.findByIdAndUpdate(user._id, {
        platforms: [...userSaved.platforms, ...platforms]
      }, {
        new: true,
        runValidators: true,
      }); else userSaved = await PublicUser.findByIdAndUpdate(user._id, {
      platforms: platforms
    }, {
      new: true,
      runValidators: true,
    });
  
    userSaved.platforms.map( async platform => {
      platformResult = await Platform.findById(platform);
      if(platformResult.customers) {
        await Platform.findByIdAndUpdate(platformResult._id, {
        customers: [...platformResult.customers, user._id ]
      }, {
        new: true,
        runValidators: true,
      })} else {
        await Platform.findByIdAndUpdate(platformResult._id, {
        customers: [ user._id ]
      }, {
        new: true,
        runValidators: true,
      }) } 
    });

    // Modificate

    await Order.findByIdAndUpdate(
      order, {
        accepted: true, 
        pending: false, 
        active: true, 
        startDate, 
        endDate }, {
      new: true,
      runValidators: true,
    })

    return res.send({type: 'success', message: 'Order accepted'});
  } catch (error) {
    console.log(error)
    res.status(400).send({type: 'error', message: error})
  }

  
})



router.get('/qrcode', async (req, res) => {
  const { user } = req.body;

  const phone = '42261632'
  const message = 'Hola'

  wbm
    .start({ qrCodeData: true, session: false, showBrowser: false })
    .then(async qrCodeData => {
      res.send(qrCodeData);
      await wbm.waitQRCode();

      const phonesAndMessages = [{phone, message}];

      await wbm.send(phonesAndMessages);
      await wbm.end();
    })
    .catch(error =>{
      console.log(error)
      return res.status(400).send({type: 'error', error})
    })
  
})

router.get('/nopending', async (req, res) => {
  const orders = await Order.find({pending: false});
  res.json(orders)
})

router.get('/rejected', async (req, res) => {
  const orders = await Order.find({accepted: false});
  res.json(orders)
})

router.get('/user/:userid', async (req, res) => {
  const { userid } = req.params;

  const user = await PublicUser.findById(userid);

  res.json({user})
})

router.patch('/:order', async (req, res) => {
  const { order } = req.params;
  const orderDB = await Order.findByIdAndUpdate(
    order,
    {
      pending: false,
      accepted: false,
    },{
      new: true,
      runValidators: true,
    }
  )
  res.send('Order Rejected');
})

router.delete('/:order', async (req, res) => {
  try{
    const { order } = req.params;
    const orderDB = await Order.findByIdAndDelete(order);
    
    await deleteImage(orderDB.public_id);
    res.send('Order Deleted');
  }
  catch(error){
    return res.status(400).json({ error });
  }
})

module.exports = router;