var nodemailer = require('nodemailer');

const transporter  = nodemailer.createTransport({
  service:process.env.EMAIL_HOST,
  port:587,
  secure: true,
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
})

module.exports = transporter;