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
  } else {
    const profile = new Profile({
      customerId: userSaved._id,
      platformId
    })
    profile.save()
  }
  
  return res.send('New profile created')
})

router.delete('/:profile', async (req, res)=>{
  const { profile } = req.params
  await Profile.findByIdAndDelete(profile)
  return res.send('Profile deleted')
})

router.put("/alias", async (req, res)=>{
  try {
    const {id, alias} = req.body
    if(alias.trim() == "") return res.send({type: 'error', text: "No puedes dejar el campo vacio."})
    await Profile.findByIdAndUpdate(id,{
      alias
    },{
      new: true,
      runValidators: true
    })
    return res.send({type: 'success', text: "Alias asignado exitosamente."})
  } catch(e){
    res.send({type: 'error', text: "Ah ocurrido un error."}).status(400)
  }
})

module.exports = router;