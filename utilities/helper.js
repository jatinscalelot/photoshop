var jwt = require('jsonwebtoken');

exports.validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
};

exports.generateOTP = () => {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

exports.generateJWTtoken = (user_id) => {
  return jwt.sign({'_id' : user_id} , process.env.JWT_AUTH_KEY , {expiresIn: '30d'});
};