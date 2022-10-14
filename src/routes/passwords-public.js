const { Router } = require('express');
const jwt = require('jsonwebtoken');
const router =  Router();

const PublicUser = require('../models/PublicUser');
const Platform = require('../models/Platform');

router.get('/', async (req, res) => {
  const token = req.header('Authorization');

  const user = jwt.decode(token);
  
  const userData = await PublicUser.findOne({email: user.email});

  const platforms = [];
  for(let i=0; i < userData.platforms.length; i++) {
    const platform = await Platform.findById(userData.platforms[i]);
    platforms.push(platform);
    if(i == userData.platforms.length - 1) res.send(platforms);
  }

});


module.exports = router;
