const { Router } = require('express');
const jwt = require('jsonwebtoken');
const router =  Router();

const Profile = require('../models/Profile');
const PublicUser = require('../models/PublicUser');
const Platform = require('../models/Platform');

router.get('/', async (req, res) => {
  try {
    const token = req.header('Authorization');

    const user = jwt.decode(token);
    const profiles = await Profile.find({customerId: user.id})
    .populate('platformId',{
      type: 1,
      email: 1,
      password: 1
    }, )

    return res.send(profiles);  
  }
  catch(e){
    console.log(e)
    return res.send([]);
  }
});

router.get('/modify', async(req, res)=>{
  const platforms = await Platform.find()

  
  for(let platform of platforms){
    if(platform.customers){
      for(let customer of platform.customers){
        const profileToSave = await new Profile({
          customerId: `${customer}`,
          platformId: platform._id
        })
        await profileToSave.save()
      }
    }
  }
  res.send('success')
})

module.exports = router;
