const express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');
const paymentModel = require('../../models/payment.model');
const helper = require('../../utilities/helper');

router.get('/' , helper.authenticateToken , async (req , res) => {
  if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let getUser = await primary.model(constants.MODELS.users , userModel).findById(req.token._id).lean();
    if(getUser != null){
      if(req.Token === getUser.token){
        if(getUser.is_subscriber === true){
          const payment = await primary.model(constants.MODELS.payments , paymentModel).findOne({userid:getUser._id}).lean();
          const currentDateTime = new Date();
          if(currentDateTime <= payment.endDate){
            // console.log("currentDateTime < payment.endDate :",currentDateTime < payment.endDate);
            let data = {
              userid: getUser._id,
              fid: getUser.fid,
              mobile: getUser.mobile,
              is_subscriber: getUser.is_subscriber,
              planType: payment.planType,
              planName: payment.planName,
              sdate: payment.startDate,
              edate: payment.endDate,
            }
            return res.status(200).send({'status': 200 , 'message': 'Get user data successfully...!' , 'userdata':data});
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
            return res.status(200).send({'status': 200 , 'message': 'Get user data successfully...!' , 'userdata':data});
          }
        }else{
          let data = {
            userid: getUser._id,
            fid: getUser.fid,
            mobile: getUser.mobile,
            is_subscriber: getUser.is_subscriber,
            planType: getUser.planType,
            planName: getUser.planName
          }
          return res.status(200).send({'status': 200 , 'message': 'Get user data successfully...!' , 'userdata':data});
        }
      }else{
        return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
      }
    }
  }else{
    return res.status(400).send({'status': 400 , 'message': 'Invalid token to get user.'});
  }
});


module.exports = router;