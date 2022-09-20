const jwt = require('jsonwebtoken');
const PublicUser = require('../models/PublicUser')

const verifyToken = (req, res, next) =>{
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({ error: 'acceso denegado' });

  try{
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  }
  catch(e){
    return res.status(400).json({ error: 'token no es valido' });
  }
}

const verifyPublicToken = async (req, res, next) =>{
  const token = req.header('Authorization');
  if(!token) return res.status(401).json({message: 'primera', type: 'error'});
  
  const decode = jwt.decode(token);
  const user = await PublicUser.findOne({ email: decode.email });
  
  if(!user) return res.status(401).send({message: 'segunda', type: 'error'});
  
  user._id = `${user._id}`

  if(!( user._id == decode.id 
        && user.name == decode.name 
        && user.email == decode.email))
     {
    return res.status(401).json({message: 'tercera', type: 'error'})
  }
  
  try{
    const verified = jwt.verify(token, process.env.TOKEN_SECRET_PUBLIC);
    req.user = verified;
    next();
  }
  catch(e){
    console.log(e)
    return res.status(401).json({ error: 'token no es valido' });
  }
}

module.exports = { verifyToken, verifyPublicToken };