var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var connectDB = require('../../utilities/connectDB');
var constants = require('../../utilities/constants');
const responseManager = require('../../utilities/response.manager');
var transporter =require('../../utilities/sendEmail');
const helper = require('../../utilities/helper');

const userModel = require('../../models/users.model');


router.post('/' , async (req , res) => {
  const {email , password , tc} = req.body;
  if(email && email != '' && helper.validateEmail(email) && password && password != ''){
    if(tc == true){
      let primary = connectDB.useDb(constants.DEFAULT_DB);
      let user = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
      if(user){
        const match_password = await bcrypt.compare(password , user.password);
        if(user.email === email && match_password){
          await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(user._id , {tc:true});
          const accessToken = helper.generateJWTtoken(user._id);
          return responseManager.onSuccess('Login successfully...!' , {token : accessToken} , res);
        }else{
          return responseManager.badrequest({ message: 'Invalid email or password.' }, res);
        }
      }else{
        return responseManager.badrequest({ message: 'Invalid email, please try again.' }, res);
      }
    }else{
      return responseManager.badrequest({ message: 'Please accept our terms & condition.' }, res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid data to login user, please try again.' }, res);
  }
});

router.post('/forgotpassword' , async (req , res) => {
  const {email} = req.body;
  if(email && email != '' && helper.validateEmail(email)){
    let primary = connectDB.useDb(constants.DEFAULT_DB);
    let user = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
    if(user){
      // var key = Date.now().toString();
      // console.log('key :',key);
      const updatedUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(user._id , {emailOTP : helper.generateOTP() , is_email_verified: false} , {returnOriginal: false}).lean();
      const info = await transporter.sendMail({
        from:process.env.EMAIL_FROM,
        to:user.email,
        subject:'Forgot password email',
        html:`Your otp is : ${updatedUser.emailOTP}`
      });
      return responseManager.onSuccess('Otp sent your email address...!' , {email : updatedUser.email} , res);
    }else{
      return responseManager.badrequest({ message: 'Invalid email, please try again.' }, res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid email, please try again.' }, res);
  }
});

router.post('/verifyotp' , async (req , res) => {
  const {email , otp} = req.body;
  if(email &&  email != '' && helper.validateEmail(email) && otp && otp != '' && otp.length == 6){
    let primary = connectDB.useDb(constants.DEFAULT_DB);
    let user = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
    if(user && user.is_email_verified == false){
      if(otp === user.emailOTP){
        await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(user._id , {is_email_verified : true});
        return responseManager.onSuccess('Email verify successfully...!' , {email: user.email} , res);
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

router.post('/resetpassword' , async (req , res) => {
  const {email , password , conform_password} = req.body;
  if(email && email != '' && helper.validateEmail(email) && password && password != '' && conform_password && conform_password != ''){
    let primary = connectDB.useDb(constants.DEFAULT_DB);
    let user = await primary.model(constants.MODELS.users , userModel).findOne({email : email}).lean();
    if(user){
      if(user.is_email_verified == true){
        if(password === conform_password){
          const salt = await bcrypt.genSalt(10);
          const hashpassword = await  bcrypt.hash(password , salt);
          await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(user._id , {password : hashpassword});
          return responseManager.onSuccess('Password change successfully...!',1,res);
        }else{
          return responseManager.badrequest({ message: 'Password and conform password does not match.' }, res);
        }
      }else{
        return responseManager.badrequest({ message: 'Please verify email first.' }, res);
      }
    }else{
      return responseManager.badrequest({ message: 'Invalid user email, please try again.' }, res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid data to reset password...!' }, res);
  }
});

module.exports = router;