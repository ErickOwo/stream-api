const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// import adminRoures
const login = require('./src/routes/login');
const { verifyToken, verifyPublicToken } = require('./src/routes/validate-token')

const platforms = require('./src/routes/platforms');
const auth = require('./src/routes/auth');

// import admin routes
const ordersAdmin = require('./src/routes/orders-admin');
const usersAdmin = require('./src/routes/users-admin'); 

// import public routes
const usersPublic = require('./src/routes/users-public');
const ordersPublic = require('./src/routes/orders-public');
const passwordsPublic = require('./src/routes/passwords-public');

// initializing express and setting port
const app = express();
app.set('port', process.env.PORT || 3005);

// initializing env props
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.fl5iae9.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true}).then(res =>{
  console.log('data base connected');
})

// Midlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// multer configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'src/public/uploads'),
  filename: (req, file, cb) =>{
    cb(null, uuidv4() + path.extname(file.originalname));
  }
})

app.use(multer({storage}).single('media'));

// authentication routes
app.use('/api', login);

app.use('/api/auth', verifyToken, auth);

// routes admin
app.use('/api/admin', verifyToken, platforms);
app.use('/api/admin/orders', verifyToken, ordersAdmin);
app.use('/api/admin/users', verifyToken, usersAdmin);

// public routres
app.use('/api/public', usersPublic);
app.use('/api/public/orders',verifyPublicToken, ordersPublic);
app.use('/api/public/passwords', verifyPublicToken, passwordsPublic);

app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
})
