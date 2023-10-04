const express = require('express');
const mongoose = require('mongoose');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');
const paymentModel = require('../../models/payment.model');

const helper = require('../../utilities/helper');

var router = express.Router();

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

// router.post('/' , helper.authenticateToken , async (req , res) => {
//   if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
//     let primary = mongoConnection.useDb(constants.DEFAULT_DB);
//     let getUser = await primary.model(constants.MODELS.users , userModel).findById(req.token._id).lean();
//     if(getUser != null){
//       if(req.Token === getUser.token){
//         const {paymentID , amount , planType , planName} = req.body;
//         if(planType === 1){
//           if(amount && amount === 89){
//             if(paymentID && paymentID != ''){
//               if(planName && planName != ''){
//                 const {currentDate , currentTimestamp , nextMonthDate , nextMonthTimestamp} = getCurrentAndNextMonthDatesWithTimestamps();
//                 const obj = {
//                   fid:getUser.fid,
//                   userid:getUser._id,
//                   paymentID:paymentID,
//                   amount: amount,
//                   planType:planType,
//                   planName: planName,
//                   startDate: currentDate, 
//                   endDate:nextMonthDate,
//                   startDate_timestamp:currentTimestamp,
//                   endDate_timestamp:nextMonthTimestamp      
//                 }
//                 const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
//                 console.log("obj :",obj);
//                 return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
//               }else{
//                 return res.status(400).send({'status': 400 , 'message': 'Invalid plan name...!'});
//               }
//             }else{
//               return res.status(400).send({'status': 400 , 'message': 'Invalid paymentID...!'});
//             }
//           }else{
//             return res.status(400).send({'status': 400 , 'message': 'Invalid amount for plan type...!'});
//           }
//         }else if(planType === 2){
//           if(amount && amount === 499){
//             if(paymentID && paymentID != ''){
//               if(planName && planName != ''){
//                 const {currentDate , currentDateTimestamp , netxYearDate , nextYearTimestamp} = addOneYearToCurrentTime();
//                 const obj = {
//                   fid:getUser.fid,
//                   userid:getUser._id,
//                   paymentID:paymentID,
//                   amount: amount,
//                   planType:planType,
//                   planName: planName,
//                   startDate: currentDate, 
//                   endDate:netxYearDate,
//                   startDate_timestamp:currentDateTimestamp,
//                   endDate_timestamp:nextYearTimestamp      
//                 }
//                 const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
//                 const updateUser = await primary.model(constants.MODELS.users , userModel).findOneAndUpdate(getUser._id , {$set: {is_subscriber:true , planType:2 , planName: planName}});
//                 // console.log("payment :",payment);
//                 return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
//               }else{
//                 return res.status(400).send({'status': 400 , 'message': 'Invalid plan name...!'});
//               }
//             }else{
//               return res.status(400).send({'status': 400 , 'message': 'Invalid paymentID...!'});
//             }
//           }else{
//             return res.status(400).send({'status': 400 , 'message': 'Invalid amount for plan type...!'});
//           }
//         }else{
//           return res.status(400).send({'status': 400 , 'message': 'Invalid plan type...!'});
//         }
//       }else{
//         return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
//       }
//     }
//   }else{
//     return res.status(400).send({'status': 400 , 'message': 'Invalid token to get user.'});
//   }
// });

router.post('/' , helper.authenticateToken , async (req , res) => {
  if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let getUser = await primary.model(constants.MODELS.users , userModel).findById(req.token._id).lean();
    if(getUser != null){
      if(req.Token === getUser.token){
        const {paymentID , amount , planType , planName} = req.body;
        if(paymentID && paymentID != ''){
          if(planType && planType === 1){
            if(amount && amount === 89){
              if(planName && planName != ''){
                const {currentDate , currentTimestamp , nextMonthDate , nextMonthTimestamp} = getCurrentAndNextMonthDatesWithTimestamps();
                const obj = {
                  fid:getUser.fid,
                  userid:getUser._id,
                  paymentID:paymentID,
                  amount: amount,
                  planType:planType,
                  planName: planName.trim(),
                  startDate: currentDate, 
                  endDate:nextMonthDate,
                  startDate_timestamp:currentTimestamp,
                  endDate_timestamp:nextMonthTimestamp      
                }
                const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
                const updateUser = await primary.model(constants.MODELS.users , userModel).findOneAndUpdate(getUser._id , {$set: {is_subscriber:true , planType:payment.planType , planName: payment.planName}});
                return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
              }else{
                return res.status(400).send({'status': 400 , 'message': 'Invalid plan name...!'})
              }
            }else{
              return res.status(400).send({'status': 400 , 'message': 'Invalid amount for plan type...!'});
            }
          }else if(planType && planType === 2){
            if(amount && amount === 499){
              if(planName && planName != ''){
                const {currentDate , currentDateTimestamp , netxYearDate , nextYearTimestamp} = addOneYearToCurrentTime();
                const obj = {
                  fid: getUser.fid,
                  userid: getUser._id,
                  paymentID: paymentID,
                  amount: amount,
                  planType:planType,
                  planName: planName.trim(),
                  startDate: currentDate, 
                  endDate: netxYearDate,
                  startDate_timestamp: currentDateTimestamp,
                  endDate_timestamp: nextYearTimestamp      
                }
                const payment = await primary.model(constants.MODELS.payments , paymentModel).create(obj);
                const updateUser = await primary.model(constants.MODELS.users , userModel).findOneAndUpdate(getUser._id , {$set: {is_subscriber:true , planType:payment.planType , planName: payment.planName}});
                return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
              }else{
                return res.status(400).send({'status': 400 , 'message': 'Invalid plan name...!'})
              }
            }else{
              return res.status(400).send({'status': 400 , 'message': 'Invalid amount for plan type...!'});
            }
          }else{
            return res.status(400).send({'status': 400 , 'message': 'Invalid plan type...!'});
          }
        }else{
          return res.status(400).send({'status': 400 , 'message': 'Invalid paymentID...!'})
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