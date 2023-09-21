var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var connectDB = require('../../utilities/connectDB');
var constants = require('../../utilities/constants');
var transporter =require('../../utilities/sendEmail');
const responseManager = require('../../utilities/response.manager');
const helper = require('../../utilities/helper');

const userModel = require('../../models/users.model');

router.post('/' , async (req , res) => {
  const {fname , lname , email , password , conform_password} = req.body;
  if(fname && fname != '' && lname && lname != '' && email && email != '' && helper.validateEmail(email) && password && password != '' && conform_password && conform_password != ''){
    if(password === conform_password){
      let primary = connectDB.useDb(constants.DEFAULT_DB);
      let checkExisting = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
      if(checkExisting == null){
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await  bcrypt.hash(password , salt);
        let obj = {
          fname : fname.trim(),
          lname : lname.trim(),
          email : email.trim(),
          emailOTP : helper.generateOTP(),
          password : hashpassword,
        };
        const info = await transporter.sendMail({
          from:process.env.EMAIL_FROM,
          to:obj.email,
          subject:'Verify your email address',
          html:`Your otp is : ${obj.emailOTP}`
        });
        let createdUser = await primary.model(constants.MODELS.users , userModel).create(obj);
        return responseManager.onSuccess('User register successfully...!' , {email : createdUser.email} , res);
      }else{
        return responseManager.badrequest({ message: 'User already exist with same mobile, Please Login...' }, res);
      }
    }else{
      return responseManager.badrequest({ message: 'Password and conform password does not match.' }, res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid data to register user, please try again.' }, res);
  }
});

router.post('/verifyotp' , async (req , res) => {
  const {email , otp} = req.body;
  if(email &&  email != '' && validateEmail(email) && otp && otp != '' && otp.length == 6){
    let primary = connectDB.useDb(constants.DEFAULT_DB);
    let user = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
    if(user && user.is_email_verified == false){
      if(otp === user.emailOTP){
        await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(user._id , {is_email_verified : true});
        return responseManager.onSuccess('Email verify successfully...!' , 1 , res);
      }else{
        return responseManager.badrequest({ message: 'Invalid otp...!' }, res);
      }
    }else{
      return responseManager.badrequest({ message: 'Invalid data to verify email...!' }, res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid email or otp to verify user email...!' }, res);
  }
});

module.exports = router;