const express = require('express');
const { filter } = require('rxjs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database Conection
const Platform = require('../models/Platform')
const PublicUser = require('../models/PublicUser')

router.get('/', async (req, res)=>{
  try{
    const platforms = await Platform.find();
    return res.json(platforms);
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.get('/asign', async (req, res)=>{
  try{
    const platforms = await Platform.find();
    
    return res.json(platforms);
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.post('/', async (req, res)=>{
  try {
    const platform = new Platform(req.body);
    await platform.save();
    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.get('/:platform_id', async (req, res)=>{
  try{
    const { platform_id } = req.params;
    const platform = await Platform.findById(platform_id);
    const customers = [];
    
    if(!platform.customers || platform.customers.length == 0 ) return res.send({platform, customers});

    for(let i=0; i < platform.customers.length; i++){
      const customerDB = await PublicUser.findById(platform.customers[i]);
      customers.push(customerDB);     
      
      if(i == platform.customers.length - 1) {
        return res.send({platform, customers});
      }
    };
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.put('/:platform_id', async (req, res)=>{
  try{
    const { platform_id } = req.params;
    
    const platform = await Platform.findByIdAndUpdate(
      platform_id,
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );

    if(!platform) return res.status(404).json({success: false, error: 'No se encontró la plataforma'})
    
    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.post('/customer/:id', async(req, res)=>{
  data = req.body;
  const {id} = req.params;

  let userSaved = await PublicUser.find({email: data.email});
  let platformSaved = await Platform.findById(id)
  let user

  if(userSaved.length == 0){
    data.password = uuidv4()
    data.platforms = [`${platformSaved._id}`]
    user = new PublicUser(data)
    await user.save()
  } else {
    user = await PublicUser.findByIdAndUpdate(
      userSaved[0]._id, {
      platforms: [...userSaved[0].platforms, `${platformSaved._id}` ]
    }, {
      new: true,
      runValidators: true,
    })
  }
  if(platformSaved.customers) {
    await Platform.findByIdAndUpdate(platformSaved._id, {
      customers: [...platformSaved.customers, `${user._id}` ]
    }, {
      new: true,
      runValidators: true,
    })} else {
      await Platform.findByIdAndUpdate(platformSaved._id, {
      customers: [ `${user._id}` ]
    }, {
      new: true,
      runValidators: true,
  })
  
 }  
 res.send('Customer added to the platform')
})

router.put('/customer/:id', async(req, res)=>{
  const data = req.body 
  const { id } = req.params

  const platformSaved = await Platform.findById(id);
  const userSaved = await PublicUser.findById(data.id);

  await Platform.findByIdAndUpdate(id, {
    customers: await platformSaved.customers.filter(customer => customer != data.id)
  }, {
    new: true,
    runValidators: true,
  })
  
  await PublicUser.findByIdAndUpdate(data.id, {
    platforms: await userSaved.platforms.filter(platform => platform != id)
  }, {
    new: true,
    runValidators: true,
  })

  res.send('Customer removed')
})

router.delete('/:platform_id', async (req, res)=>{
  try{
    const { platform_id } = req.params;
    
    const platform = await Platform.findByIdAndDelete(platform_id);

    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

module.exports = router;