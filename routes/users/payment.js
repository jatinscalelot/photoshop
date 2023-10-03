const express = require('express');
const mongoose = require('mongoose');
const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');
const paymentModel = require('../../models/payment.model');

const helper = require('../../utilities/helper');

var router = express.Router();

router.post('/' , helper.authenticateToken , async (req , res) => {
  if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let getUser = await primary.model(constants.MODELS.users , userModel).findById(req.token._id).lean();
    if(getUser != null){
      if(req.Token === getUser.token){
        return res.status(200).send({'status': 200 , 'message': 'Payement done successfully...!'});
      }else{
        return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
      }
    }
  }else{
    return res.status(400).send({'status': 400 , 'message': 'Invalid token to get user.'});
  }
});

module.exports = router;