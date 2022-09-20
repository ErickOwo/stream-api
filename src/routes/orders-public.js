const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');

//models
const PublicUser = require('../models/PublicUser');
const Order = require('../models/Order');

// Joi schemas
const { schemaOrders } = require('../utils/schemas-joi')

const { addImage } = require('../utils/use-media');

router.get('/', async (req, res) => {
  const token = req.header('Authorization');
  const decode = jwt.decode(token);
  
  const orders = await Order.find({userCustomer: decode.id}) 
  orders.reverse();
  res.send(orders)
})

router.post('/', async (req, res) => {
  try{
    let { info } = req.body;
    info = JSON.parse(info);
    
    const { error } = schemaOrders.validate(info);
    if(error) return res.status(400).json({ error: error.details[0].message });

    const { 
      user,
      orderNumber,
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      months,
      bankCode
    } = info;

    const total = () => {
      const descount = months == 2 ? 5 : months == 4 ? 10 : 0;
      const platforms =
        disneyProfiles * (25 - descount) +
        hboProfiles * (25 - descount) +
        primeProfiles * (25 - descount) +
        paramountProfiles * (25 - descount) +
        starProfiles * (25 - descount);
      return platforms * months;
    };

    const userSaved = await PublicUser.findById(user.id);
    if(!userSaved) res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})
    userSaved._id = `${userSaved._id}`

    if(!( userSaved._id == user.id 
       && userSaved.name == user.name 
       && userSaved.email == user.email)){
        return res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})
       }

    let bank;

    if(bankCode == 2) bank = 'BI';
    else if(bankCode == 1) bank = 'Bantrab';
    else bank = 'Banrural';

    const result = await addImage(req.file.path, 'Stream Play/orders')
    
    const data = {
      userCustomer: userSaved._id,
      orderNumber,
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      months,
      bank,
      imgURL: result.url,
      public_id: result.public_id, 
      total: total()     
    }

    const newObject = await new Order(data);

    await newObject.save();

    let orders = [];

    if(userSaved.orders) orders = [...userSaved.orders, newObject._id]; 
    else orders = [newObject.userCustomer._id];

    await PublicUser.findByIdAndUpdate(
      userSaved.id,
      {
        orders
      },
      {
        new: true,
        runValidators: true,
      }
    )

    await fs.unlink(req.file.path);

    return res.json({message: 'Objeto agregado correctamente', type: 'success'});
  }
  catch(error){
    console.log(error)
    return res.status(400).json({error})
  }
});


module.exports = router;
