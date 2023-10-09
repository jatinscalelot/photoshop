const express = require('express');
const jwt = require('jsonwebtoken');

const admin = require('../../config/firebaseAdmin');
const helper = require('../../utilities/helper');

const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');
const paymentModel = require('../../models/payment.model');

var router = express.Router();

router.post('/' , helper.firebasetoken ,async (req , res) => {
  const token = req.token;
  if(token && token != ''){
    try {
      await admin.auth().verifyIdToken(token).then(async (decodedToken) => {
        let primary =  mongoConnection.useDb(constants.DEFAULT_DB);
        let findUser = await primary.model(constants.MODELS.users , userModel).findOne({"mobile": decodedToken.phone_number}).lean();
        if(findUser == null){
          let obj = {
            fid: decodedToken.uid,
            mobile: decodedToken.phone_number,
            is_login: true
          }
          let newUser = await primary.model(constants.MODELS.users , userModel).create(obj);
          let token = jwt.sign({_id : newUser._id} , process.env.PRIVETKEY , {expiresIn: '30d'});
          let updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(newUser._id , {token: token} , {returnOriginal: false});
          data = {
            userid: updateUser._id,
            fid: updateUser.fid,
            is_subscriber: updateUser.is_subscriber,
            planType: updateUser.planType,
            planName: updateUser.planName,
            token: updateUser.token
          }
          return res.status(201).send({'status':201 , 'message': 'User created successfully...!' , "userdata": data});
        }else{
          const token = jwt.sign({_id : findUser._id} , process.env.PRIVETKEY , {expiresIn: '30d'});
          const updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(findUser._id , {$set: {token: token , is_login: true}} , {returnOriginal: false});
          if(updateUser.is_subscriber === true){
            const payment = await primary.model(constants.MODELS.payments , paymentModel).findOne({userid:updateUser._id , active: true}).lean();
            const currentDateTime = new Date();
            if(currentDateTime <= payment.endDate){
              let data = {
                userid: updateUser._id,
                fid: updateUser.fid,
                is_subscriber: updateUser.is_subscriber,
                planType: payment.planType,
                planName: payment.planName,
                sdate: payment.startDate,
                edate: payment.endDate,
                token: updateUser.token
              }
              return res.status(200).send({'status': 200 , 'message': 'Login successfully...!' , 'userdata':data});
            }else{
              const updatePayment = await primary.model(constants.MODELS.payments , paymentModel).findByIdAndUpdate(updateUser.pID , {active: false});
              const updateIsSubscriber = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(updateUser._id , {$set: {is_subscriber:false , pID: null , paymentID: '' , planType: 0 , planName: 'free'}} , {returnOriginal:false});
              let data = {
                userid: updateIsSubscriber._id,
                fid: updateIsSubscriber.fid,
                is_subscriber: updateIsSubscriber.is_subscriber,
                planType: updateIsSubscriber.planType,
                planName: updateIsSubscriber.planName,
                token: updateIsSubscriber.token
              }
              return res.status(200).send({'status': 200 , 'message': 'Login successfully...!' , 'userdata':data});
            }
          }else{
            let data = {
              fid: updateUser.fid,
              is_subscriber: updateUser.is_subscriber,
              planType: updateUser.planType,
              planName: updateUser.planName,
              token: updateUser.token
            }
            return res.status(200).send({'status': 200 , 'message': 'Login successfully...!' , 'userdata':data});
          }
        }
      }).catch(async (error) => {
        if(error.errorInfo.code === 'auth/id-token-expired'){          
          return res.status(401).send({'status':401 ,'message': 'Token expired...!'});
        }else{
          console.log("error :",error);
          return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
        }
      })
    } catch (error) {
      console.log("outer catch error :",error);
      return res.status(500).send({'status':500 ,'message': 'Internal server error...!'});
    }
  }else{
    return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
  }
})

module.exports = router;