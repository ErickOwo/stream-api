const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const login = require('./src/routes/login');
const validateToken = require('./src/routes/validate-token')

const platforms = require('./src/routes/platforms');
const auth = require('./src/routes/auth');

const app = express();
app.set('port', process.env.PORT || 3005);

// initializing env props
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.fl5iae9.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true}).then(res =>{
  console.log('data base connected')
})

// Midlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api', login);

app.use('/api/auth', validateToken, auth);

// routes admin
app.use('/api/admin', validateToken, platforms);


app.listen(app.get('port'), () => {
  console.log(`Servidor escuchando en el pueto ${app.get('port')}`);
})
