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
      netflixProfiles,
      spotifyProfiles,
      crunchyrollProfiles,
      months,
      bankCode
    } = info;

    const total = () => {
      const descount = months == 2 ? 5 : months == 4 ? 10 : 0;
      const platforms =
        disneyProfiles * (25 - descount) +
        hboProfiles * (30 - descount) +
        primeProfiles * (30 - descount) +
        paramountProfiles * (25 - descount) +
        starProfiles * (30 - descount) +
        spotifyProfiles * (35 - descount) +
        crunchyrollProfiles * (35 - descount) +
        netflixProfiles * (40 - descount);
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

    const result = await addImage(req.file.path, 'Stream Play/orders')
    
    const data = {
      userCustomer: userSaved._id,
      orderNumber,
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      netflixProfiles,
      spotifyProfiles,
      crunchyrollProfiles,
      months,
      bank,
      imgURL: result.url,
      public_id: result.public_id, 
      total: total()     
    }

    const newObject = await new Order(data);

    await newObject.save();
   
    await fs.unlink(req.file.path);

    return res.json({message: 'Pedido Realizado con éxito', type: 'success'});
  }
  catch(error){
    console.log(error)
    return res.status(400).json({error})
  }
});


module.exports = router;
