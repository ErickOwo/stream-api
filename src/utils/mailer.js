//prueba del Mailer
const nodemailer = require('nodemailer');
//import googleAPI
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
//import JSON
const accountTransport = require('../../account_transport.json')

const mailRover = async (callback) =>{
  const oauth2Client = new OAuth2(
    accountTransport.auth.clientId,
    accountTransport.auth.clientSecret,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({
    refresh_token: accountTransport.auth.refreshToken,
    tls: {
      rejectUnauthorized: false
    }
  });
  oauth2Client.getAccessToken((err, token)=>{
    if(err)
      return console.log(err)
    accountTransport.auth.accessToken = token;
    callback(nodemailer.createTransport(accountTransport));
  })
}
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: 'streamplaybussines@gmail.com', // generated ethereal user
//     pass: 'pzukgfmevysbcubs', // generated ethereal password
//   },
// });

const sendEmail = (people, subject, message) =>{
  
  mailRover(emailTransporter =>{
    people.forEach( async (person, index) =>{
      const info = await emailTransporter.sendMail({
        from: '"Stream Play" <streamplaybussines@gmail.com>', // sender address
        to: person.email, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: message, // html body
      }, (err, res) =>{
        if (err) {
          console.log(err)
        } 
      });
    })
  })
  
}

module.exports = sendEmail;
