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

router.post("/alias", async (req, res)=>{
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
