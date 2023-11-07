const express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');
const paymentModel = require('../../models/payment.model');
const helper = require('../../utilities/helper');

function getCurrentAndNextMonthDatesWithTimestamps() {
  const currentDate = new Date();

  const nextMonthDate = new Date(currentDate);
  nextMonthDate.setMonth(currentDate.getMonth() + 1);

  const currentTimestamp = currentDate.getTime();
  const nextMonthTimestamp = nextMonthDate.getTime();

  return {
    currentDate,
    currentTimestamp,
    nextMonthDate,
    nextMonthTimestamp,
  };
}

function addOneYearToCurrentTime() {
  const currentDate = new Date();

  const netxYearDate = new Date(currentDate);

  netxYearDate.setFullYear(netxYearDate.getFullYear() + 1);

  const currentDateTimestamp = currentDate.getTime();
  const nextYearTimestamp = netxYearDate.getTime();

  return {
    currentDate,
    currentDateTimestamp,
    netxYearDate,
    nextYearTimestamp,
  };
}

router.post('/callback' , helper.authenticateToken , async (req , res) => {
  if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let getUser = await primary.model(constants.MODELS.users , userModel).findById(req.token._id).lean();
    if(getUser != null){
      if(req.Token === getUser.token){
        if(getUser.is_subscriber === false){
          const {paymentID , planType , planName} = req.body;
          if(paymentID && paymentID != ''){
            await stripe.paymentIntents.retrieve(paymentID.trim() , async (error , paymentIntent) => {
              if(error){
                console.log('error while retrieving payment intent :',error);
                return res.status(404).send({'status': 404 , 'message': 'No payment data found...!'});
              }else{
                if(paymentIntent){
                  if(paymentIntent.status === 'succeeded'){
                    if(paymentIntent.description && paymentIntent.description != '' && paymentIntent.description.trim() === getUser.fid){
                      if(planType === 1){
                        const {currentDate , currentTimestamp , nextMonthDate , nextMonthTimestamp} = getCurrentAndNextMonthDatesWithTimestamps();
                        const obj = {
                          fid: getUser.fid,
                          userid: getUser._id,
                          paymentID: paymentID,
                          currency: paymentIntent.currency,
                          amount: paymentIntent.amount,
                          planType: planType,
                          planName: planName,
                          payment_method: paymentIntent.payment_method,
                          payment_method_types: paymentIntent.payment_method_types,
                          paymentStatus: paymentIntent.status,
                          created: paymentIntent.created,
                          active: true,
                          startDate: currentDate, 
                          endDate: nextMonthDate,
                          startDate_timestamp: currentTimestamp,
                          endDate_timestamp: nextMonthTimestamp      
                        };
                        const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
                        const updateDetails = {
                          is_subscriber: true,
                          pID: payment._id,
                          paymentID: payment.paymentID,
                          planType: payment.planType,
                          planName: payment.planName
                        };
                        const updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(getUser._id , updateDetails , {returnOriginal: false});
                        return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
                      }else if(planType === 2){
                        const {currentDate , currentDateTimestamp , netxYearDate , nextYearTimestamp} = addOneYearToCurrentTime();
                        const obj = {
                          fid: getUser.fid,
                          userid: getUser._id,
                          paymentID: paymentID,
                          currency: paymentIntent.currency,
                          amount: paymentIntent.amount,
                          planType: planType,
                          planName: planName,
                          payment_method: paymentIntent.payment_method,
                          payment_method_types: paymentIntent.payment_method_types,
                          paymentStatus: paymentIntent.status,
                          created: paymentIntent.created,
                          active: true,
                          startDate: currentDate, 
                          endDate: netxYearDate,
                          startDate_timestamp: currentDateTimestamp,
                          endDate_timestamp: nextYearTimestamp      
                        }
                        const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
                        const updateDetails = {
                          is_subscriber: true,
                          pID: payment._id,
                          paymentID: payment.paymentID,
                          planType: payment.planType,
                          planName: payment.planName
                        };
                        const updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(getUser._id , updateDetails , {returnOriginal: false});
                        return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
                      }else{
                        return res.status(400).send({'status': 400 , 'message': 'Invalid plan type...!'});
                      }
                    }else{
                      return res.status(400).send({'status':400 , 'message': 'Bad request...!'});
                    }
                  }else{
                    return res.status(400).send({'status':400 , 'message': 'Invalid payment status...!'});
                  }
                }else{
                  return res.status(404).send({'status': 404 , 'message': 'No payment data found...!'});
                }
              }
            });
          }else{
            return res.status(400).send({'status':400 ,'message': 'Invalid paymentID...!'});
          }
        }else{
          return res.status(400).send({'status':400 ,'message': 'Already subscribered...!'});
        }
      }else{
        return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
      }
    }else{
      return res.status(404).send({'status': 404 , 'message': 'Invalid token to get user.'});
    }
  }else{
    return res.status(404).send({'status': 404 , 'message': 'Invalid token to get user.'});
  }
});

module.exports = router;