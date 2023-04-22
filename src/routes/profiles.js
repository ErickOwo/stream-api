const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Database Conection
const Platform = require('../models/Platform')
const PublicUser = require('../models/PublicUser')
const Profile = require('../models/Profile')

router.post("/:platformId", async(req, res)=>{
  data = req.body;
  const { platformId } = req.params

  let userSaved = await PublicUser.findOne({email: data.email});

  if(!userSaved){
    data.password = uuidv4()
    const user = new PublicUser(data)
    const userSaved = await user.save()
    const profile = new Profile({
      customerId: userSaved._id,
      platformId 
    })
    profile.save()
    const platform = await Platform.findById(profile.platformId)
    await Platform.findByIdAndUpdate(profile.platformId,{
      profiles: [...platform.profiles, profile._id]
    })
  } else {
    const profile = new Profile({
      customerId: userSaved._id,
      platformId
    })
    profile.save()
    const platform = await Platform.findById(profile.platformId)
    await Platform.findByIdAndUpdate(profile.platformId,{
      profiles: [...platform.profiles, profile._id]
    })
  }
  
  return res.send('New profile created')
})

router.delete('/:profile', async (req, res)=>{
  const { profile } = req.params
  const deletedProfile = await Profile.findByIdAndDelete(profile)
  return res.send('Profile deleted')
})

module.exports = router;