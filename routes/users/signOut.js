var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
var connectDB = require('../../utilities/connectDB');
var constants = require('../../utilities/constants');
const responseManager = require('../../utilities/response.manager');
const helper = require('../../utilities/helper');

const userModel = require('../../models/users.model');

router.post('/' , helper.authenticateToken , async (req , res) => {
  if(req.token._id && mongoose.Types.ObjectId.isValid(req.token._id)){
    let primary = connectDB.useDb(constants.DEFAULT_DB);
    let user = await primary.model(constants.MODELS.users , userModel).findById(req.token._id);
    if(user && user.tc == true){
      await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(req.token._id , {tc : false});
      return responseManager.onSuccess('Logout successfully...!', 1 , res);
    }else{
      return responseManager.badrequest({message: 'Invalid token to get user, please try again'} , res);
    }
  }else{
    return responseManager.badrequest({ message: 'Invalid token to get user, please try again' }, res);
  }
});

module.exports = router;