const express = require('express');
const Platform = require('../models/Platform')

const router = express.Router();

router.get('/platforms', async (req, res)=>{
  try{
    const platforms = await Platform.find();
    return res.json({platforms});
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.post('/platforms', async (req, res)=>{
  try {
    const platform = new Platform(req.body);
    await platform.save();
    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.get('/platforms/:platform_id', async (req, res)=>{
  try{
    const { platform_id } = req.params;
    const platform = await Platform.findById(platform_id);
    return res.json({platform});
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.put('/platforms/:platform_id', async (req, res)=>{
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

    if(!platform) res.status(404).json({success: false, error: 'No se encontró la plataforma'})
    
    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

router.delete('/platforms/:platform_id', async (req, res)=>{
  try{
    const { platform_id } = req.params;
    
    const platform = await Platform.findByIdAndDelete(platform_id);

    return res.json({ success: true, platform });
  } catch(error) {
    return res.status(400).json({ success: false, error });
  }
});

module.exports = router;