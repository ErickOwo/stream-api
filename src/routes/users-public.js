const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Joi = require('@hapi/joi')
const sendEmail = require('../utils/mailer')

//models
const PublicUser = require('../models/PublicUser');
const Mail = require('../models/Mail')

// essentials to authenticate
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//schema recovery password
const schemaRecovery = Joi.object({
  email: Joi.string().max(260).required().email()
})

const { schemaRegisterUser, schemaLoginUser  } = require('../utils/schemas-joi');

router.post('/profile', async (req, res)=>{
  try{
    const token = req.body.token;
    const decode = jwt.decode(token);
    const isEmailExist = await PublicUser.findOne({email: decode.email});
    if(isEmailExist && isEmailExist._id == decode.id) return res.send(decode);
    else throw('email no registrado');
  } catch(error){
    return res.status(400).send(error);
  }
});

router.post('/users/mail', async (req, res) => {
  try{
    const mail = new Mail(req.body);
    await mail.save();
    
    return res.json({ success: true, mail });
  }
  catch(e){
    return res.status(400).json({ success: false, error: e })
  }
})

router.post('/users', async (req, res)=>{
  try {
    const { error } = schemaRegisterUser.validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message });

    const isEmailExist = await PublicUser.findOne({ email: req.body.email });
    if(isEmailExist) return res.status(400).json({ error: 'Correo electrónico ya registrado' });

    const salt = await bcrypt.genSalt(11);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new PublicUser({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password,
    })

   await user.save();

   return res.json({ error: null, message: "Usuario agregado correctamente"}); 
  
  } catch(error) {
    return res.status(400).json(error);
  } 
});

router.post('/loginuserpublic', async (req, res) => {

  const user = await PublicUser.findOne({ email: req.body.email });
  if(!user) return res.send({error: true, message: "Usuario o contraseña incorrecto"});

  const validatePassword = await bcrypt.compare(req.body.password, user.password);
    
  if(!validatePassword) return res.status(400).json({ error: 'Usuario o contraseña incorrecto' });
  
  user._id = `${user._id}`;

  const access_token = jwt.sign({
    name: user.name,
    email: user.email,
    id: user._id,
  }, process.env.TOKEN_SECRET_PUBLIC);
  
  return res.header('auth-token', access_token).json({ 
    error: null, 
    message: "Bienvenido", 
    access_token });
});


router.post('/users/recoverpassword', async (req, res) =>{
  try {
    const { error } = schemaRecovery.validate(req.body);
    if(error) return res.status(400).json({ error: error.details[0].message });
    const userDB = await PublicUser.findOne({ email: req.body.email });
    if(!userDB) return res.status(400).json({ error: 'Usuario no registrado.' });
    let idRecover = uuidv4()
    idRecover = idRecover.replaceAll('-', `${parseInt(Math.random() * 10)}`)

    await PublicUser.findOneAndUpdate(userDB._id, {
      idRecover,
      dateRecover: Date.now()
    }, {
      new: true,
      runValidators: true,
    })

    const htmlCode = `
      <div style="padding: 2px; display: flex; flex-direction: column;">
        <h2>Activación de tu nueva contraseña de Stream play</h2>
        <div style="padding: 1px; border: 1px; border-color: '#111';">
          <h3>¡Hola: Estimado ${userDB.name}!</h3>
          <p>Has recibido este correo porque has solicitado cambiar tu contraseña para tu cuenta de Stream Play</p>
          <p>Para cambiarla haz clic en el siguiente botón.</p>
          <a href='https://stream-play.vercel.app/changepassword/${idRecover}' style='color: "#006";'>Cambiar Contraseña</a>
          <hr/>
          <p>Si no has solicitado cambiar tu contraseña por favor ignora este mensaje.</p>
        </div>
      </div>
    `

    sendEmail([{email: req.body.email}], 'Activación de tu nueva contraseña de Stream Play', htmlCode)

    return res.send({text: 'Se ha enviado un correo a tu dirección de correo electrónico con instrucciones para restaurar la contraseña, si es que existe en nuestro sistema.', type:'success'})
  } catch(error) {
    return res.status(400).json(error);
  } 
})

router.post('/users/changepassword/:recoverid', async (req, res) =>{
  const recoverid = req.params.recoverid;
 
  const userDB = await PublicUser.findOne({idRecover: recoverid})
  if(!userDB) return res.status(400).json({ error: 'Enlace expirado. Revisa tu correo y busca correo reciente de cambio de contraseña o vuelve a socitar un cambio de contraseña.' });

  const salt = await bcrypt.genSalt(11);
  const password = await bcrypt.hash(req.body.password, salt);

  await PublicUser.findOneAndUpdate(userDB._id, {
    idRecover: null,
    dateRecover: null,
    password
  }, {
    new: true,
    runValidators: true,
  })

  res.send({text: 'Cambio de contraseña completado', type: 'success'})
})

module.exports = router;