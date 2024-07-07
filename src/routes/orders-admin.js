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
  const orders = await Order.find({pending: true, active: null});
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
  const orders = await Order.find({accepted: false}).populate(
    'userCustomer',
    {
      name: 1,
      email: 1,
      phone: 1
    }
  );
  res.json(orders)
})

router.get('/accepted', async (req, res) => {
  const orders = await Order.find({active: true}).populate(
    'userCustomer',
    {
      name: 1,
      email: 1,
      phone: 1
    }
  )
  res.json(orders)
})
router.get('/noactive', async (req, res) => {
  const orders = await Order.find({active: false, accepted: true}).populate(
    'userCustomer',
    {
      name: 1,
      email: 1,
      phone: 1
    }
  )
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
      active: false
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
      accepted: true,
      pending: false,
      active: true
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
      spotifyProfiles,
      vixProfiles,
    }  = dataToRead
 
  
    const result = await addImage(req.file.path, 'Stream Play/orders')
  
    const dataOrder = {
      orderNumber: uuidv4(),
      pending: false,
      disneyProfiles,
      hboProfiles,
      primeProfiles,
      paramountProfiles,
      starProfiles,
      vixProfiles,
      netflixProfiles,
      spotifyProfiles,
      months,
      bank: bankCode,
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
        } else {
          for (let profile of platforms){
            const profileToSave = await new Profile({
              customerId: `${userSaved._id}`,
              platformId: profile
            })
      
            profileToSave.save()
            
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
        
      } else {
        for (let profile of platforms){
          const profileToSave = await new Profile({
            customerId: `${userSaved._id}`,
            platformId: profile
          })
    
          profileToSave.save()

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

router.put("/desactive/:idOrder", async (req,res)=>{
  const {idOrder} = req.params;
  await Order.findByIdAndUpdate(idOrder,{
    active: false
  },{
    new: true,
    runValidators: true
  })
  return res.send({text: 'Changes realized successfully', type: 'success'})
})
router.put('/acceptpayment/:order', async(req, res)=>{
  const orderID = req.params.order
  const orderDB = await Order.findById(orderID)
  await deleteImage(orderDB.public_id);
  await Order.findByIdAndUpdate(
    orderDB._id,
    {
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      imgURL: orderDB.imgRequest,
      public_id: orderDB.public_id_Request, 
      accepted: true,
      pending: false,
      active: true,
      imgRequest: null,
      public_id_Request: null
    }, {
      new: true,
      runValidators: true,
    }
  )
  return res.send({text: 'Changes realized successfully', type: 'success'})
})

router.put('/rejectpayment/:idOrder', async (req, res)=>{
  try {
    const {idOrder} = req.params
    const orderDB = await Order.findById(idOrder)
    await deleteImage(orderDB.public_id_Request)
    await Order.findByIdAndUpdate(idOrder,{
      imgRequest: null,
      public_id_Request: null,
      pending: false
    },{
      runValidators: true,
      new: true
    })
    return res.send({text: 'Changes realized successfully', type: 'success'})
  } catch (e) {
    return res.status(404).send({text: 'API failed', type: 'error'})
  }
})

module.exports = router;