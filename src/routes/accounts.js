const express = require('express');
const router = express.Router();

const Account = require('../models/Account');
const Platform = require('../models/Platform')

router.get('/', async (req, res)=>{
  try{
    const accounts = await Account.find();
    res.json(accounts);
  } catch(error){
    res.json(error);
  }
});

router.post('/', async (req, res)=>{
  try{
    const account = new Account(req.body);
    await account.save();
    res.json({
      status: 'Account saved'
    });
  } catch(error){
    res.json(error);
  }
});

router.put('/:id', async (req, res)=>{
  try{
    const { id } = req.params;
    const account = req.body;
    await Account.findByIdAndUpdate(id, {$set: account}, {new: true});
    res.json({
      status: 'Account updated'
    });
  } catch(error){
    res.json(error);
  }
});


router.patch('/',async(req, res)=>{
  try{
    const letcode = req.body.code; 

    const account = await Account.findOne({typeCode:letcode})
    if(!account) throw("There is not an account with that type code")

    
    res.send({message: "changes succesfull", account})
  } catch(e){
    res.send({error: e, message: "We had an error"}).status(400)
  }
})


module.exports = router;