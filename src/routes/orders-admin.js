const express = require('express');
const wbm = require('../utils/wbm');
const router = express.Router();
const fs = require('fs-extra');
const {v4: uuidv4} = require('uuid')

// models
const Order = require('../models/Order');
const PublicUser = require('../models/PublicUser');
const Platform = require('../models/Platform')
const Profile = require('../models/Profile')

router.get('/pending', async (req, res) => {
  const orders = await Order.find({pending: true});
  res.json(orders)
})

const { addImage, deleteImage } = require('../utils/use-media');

router.put('/', async (req, res) => {
  try {  
    
    const { platforms, user, order, startDate, endDate } = req.body;

    let userSaved = await PublicUser.findById(user._id);
  
    if(!userSaved) res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})

    if(!( userSaved._id == user._id 
       && userSaved.name == user.name 
       && userSaved.email == user.email)){
      return res.status(401).json({message: 'Error de autenticación de usuario', type: 'error'})
    }

    for (let profile of platforms){
      const profileToSave = await new Profile({
        customerId: `${userSaved._id}`,
        platformId: profile
      })

      profileToSave.save()
      const platform = await Platform.findById(profileToSave.platformId)
      await Platform.findByIdAndUpdate(profileToSave.platformId,{
        profiles: [...platform.profiles, profileToSave._id]
      })
    }    

    //Modificate

    await Order.findByIdAndUpdate(
      order, {
        accepted: true, 
        pending: false, 
        active: true, 
        startDate: new Date(startDate),
        endDate: new Date(endDate) }, {
      new: true,
      runValidators: true,
    })

    return res.send({type: 'success', message: 'Order accepted'});
  } catch (error) {
    console.log(error)
    res.status(400).send({type: 'error', message: error})
  }

  
})



router.get('/qrcode', async (req, res) => {
  const { user } = req.body;

  const phone = '42261632'
  const message = 'Hola'

  wbm
    .start({ qrCodeData: true, session: false, showBrowser: false })
    .then(async qrCodeData => {
      res.send(qrCodeData);
      await wbm.waitQRCode();

      const phonesAndMessages = [{phone, message}];

      await wbm.send(phonesAndMessages);
      await wbm.end();
    })
    .catch(error =>{
      console.log(error)
      return res.status(400).send({type: 'error', error})
    })
  
})

router.get('/nopending', async (req, res) => {
  const orders = await Order.find({pending: false});
  res.json(orders)
})

router.get('/rejected', async (req, res) => {
  const orders = await Order.find({accepted: false});
  res.json(orders)
})

router.get('/accepted', async (req, res) => {
  const orders = await Order.find({accepted: true});
  res.json(orders)
})

router.get('/user/:userid', async (req, res) => {
  const { userid } = req.params;

  const user = await PublicUser.findById(userid);

  res.json({user})
})

router.get('/:order', async (req, res) => {
  const { order } = req.params;
  const orderDB = await Order.findById(order)
  const publicUser = await PublicUser.findById(orderDB.userCustomer)
  res.send({orderDB, publicUser});
})

router.patch('/:order', async (req, res) => {
  const { order } = req.params;
  await Order.findByIdAndUpdate(
    order,
    {
      pending: false,
      accepted: false,
    },{
      new: true,
      runValidators: true,
    }
  )
  res.send('Order Rejected');
})

router.delete('/:order', async (req, res) => {
  try{
    const { order } = req.params;
    const orderDB = await Order.findByIdAndDelete(order);
    
    await deleteImage(orderDB.public_id);
    res.send('Order Deleted');
  }
  catch(error){
    return res.status(400).json({ error });
  }
})

router.patch('/update/:order', async(req, res)=>{
  const orderID = req.params.order
  const orderDB = await Order.findById(orderID)
  await deleteImage(orderDB.public_id);
  const result = await addImage(req.file.path, 'Stream Play/orders')
  await Order.findByIdAndUpdate(
    orderDB._id,
    {
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      imgURL: result.url,
      public_id: result.public_id, 
    }, {
      new: true,
      runValidators: true,
    }
  )
  await fs.unlink(req.file.path);
  res.send({text: 'Changes realized successfully', type: 'success'})
})

router.post('/create', async(req, res)=>{
  try {
    const {
      name,
      email,
      phone,
      platforms,
      startDate,
      endDate,
      data,
      bankCode,
      months,
      total    
    } = req.body
  
    const dataToRead = JSON.parse(data)
    const {
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      netflixProfiles,
      spotifyProfiles
    }  = dataToRead
  
    let bank;
      
    if(bankCode == 3) bank = 'BAC';
    else if(bankCode == 2) bank = 'BI';
    else if(bankCode == 1) bank = 'Bantrab';
    else bank = 'Banrural';
  
    const result = await addImage(req.file.path, 'Stream Play/orders')
  
    const dataOrder = {
      orderNumber: uuidv4(),
      pending: false,
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      netflixProfiles,
      spotifyProfiles,
      months,
      bank,
      imgURL: result.url,
      public_id: result.public_id, 
      total,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }

    const userSaved = await PublicUser.findOne({email});
    if(!userSaved){ 
      // user unexist
      try {
        let randomEmail = null
        if(email == '') {
          if(name=='') return res.send({text: 'Fill the field name', type:'error'}).status(401)
          // uuid random email
          let codeuuid = uuidv4()
          randomEmail = codeuuid.replaceAll('-','')
          randomEmail = randomEmail.substring(0,9) + '@gmail.com'
        } 
        const password = uuidv4()
        const user = new PublicUser({
            name, 
            email: randomEmail || email,
            phone: phone == '' ? '11111111' : phone,
            password
          })
        const userSaved = await user.save()
        // creating profile or profiles
        if(typeof platforms == 'string'){
          const profileToSave = await new Profile({
            customerId: `${userSaved._id}`,
            platformId: platforms
          })
    
          profileToSave.save()
          const platform = await Platform.findById(profileToSave.platformId)
          await Platform.findByIdAndUpdate(profileToSave.platformId,{
            profiles: [...platform.profiles, profileToSave._id]
          })
        } else {
          for (let profile of platforms){
            const profileToSave = await new Profile({
              customerId: `${userSaved._id}`,
              platformId: profile
            })
      
            profileToSave.save()
            const platform = await Platform.findById(profileToSave.platformId)
            await Platform.findByIdAndUpdate(profileToSave.platformId,{
              profiles: [...platform.profiles, profileToSave._id]
            })
          }   
        }
        //creating order
        dataOrder.userCustomer  = userSaved._id
        const newObject = await new Order(dataOrder);
    
        const orderSaved= await newObject.save();
      
        await Order.findByIdAndUpdate(
          orderSaved, {
            accepted: true, 
            active: true,
          }, {
          new: true,
          runValidators: true,
        })
    
    
        await fs.unlink(req.file.path);
        return res.send({text: 'Order created successfully', type: 'success'})
      } catch (e) {
        console.log(e)
        return res.send({text: 'Data incompleted', type: 'error'}).status(400)
      }
    } else{
       dataOrder.userCustomer  = userSaved._id

      // creating profile or profiles
      if(typeof platforms == 'string'){
        const profileToSave = await new Profile({
          customerId: `${userSaved._id}`,
          platformId: platforms
        })
  
        profileToSave.save()
        const platform = await Platform.findById(profileToSave.platformId)
        await Platform.findByIdAndUpdate(profileToSave.platformId,{
          profiles: [...platform.profiles, profileToSave._id]
        })
        
      } else {
        for (let profile of platforms){
          const profileToSave = await new Profile({
            customerId: `${userSaved._id}`,
            platformId: profile
          })
    
          profileToSave.save()
          const platform = await Platform.findById(profileToSave.platformId)
          await Platform.findByIdAndUpdate(profileToSave.platformId,{
            profiles: [...platform.profiles, profileToSave._id]
          })
        }   
      }
      
      
      //creating order
      const newObject = await new Order(dataOrder);
  
      const orderSaved= await newObject.save();
     
      await Order.findByIdAndUpdate(
        orderSaved, {
          accepted: true, 
          active: true,
        }, {
        new: true,
        runValidators: true,
      })
  
  
      await fs.unlink(req.file.path);
      return res.send({text: 'Order created successfully', type: 'success'})
      
    }
  }
  catch (e){
    console.log(e)
    return res.send({text: 'Order failed', type: 'success'}).status(400)
  }
})


module.exports = router;