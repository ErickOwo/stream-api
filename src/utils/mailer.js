//mnxzxltbxuezlgrr
//prueba del Mailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'e12antonio@gmail.com', // generated ethereal user
    pass: 'mnxzxltbxuezlgrr', // generated ethereal password
  },
});

const sendEmail = (people, subject, message) =>{
  
  transporter.verify();
  
  people.forEach( async (person, index) =>{
    const info = await transporter.sendMail({
      from: '"SportTown" <e12antonio@gmail.com>', // sender address
      to: person.email, // list of receivers
      subject: subject, // Subject line
      text: message, // plain text body
      html: message, // html body
    });
  })
  return;
}

module.exports = sendEmail;
