const express = require('express');
const router = express.Router();


// Database Conection
const Platform = require('../models/Platform')
const PublicUser = require('../models/PublicUser')
const Profile = require('../models/Profile')

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

    const customers = await Profile.find({platformId : platform._id})
    .populate('customerId',{
      name: 1,
      email: 1,
      phone: 1
    }, )

    return res.send({platform, customers});
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