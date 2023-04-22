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



module.exports = router;
