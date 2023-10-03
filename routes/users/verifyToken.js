const express = require('express');
const jwt = require('jsonwebtoken');

const admin = require('../../config/firebaseAdmin');
const helper = require('../../utilities/helper');
const responseManager = require('../../utilities/response.manager');

const mongoConnection = require('../../utilities/connections');
const constants = require('../../utilities/constants');
const userModel = require('../../models/user.model');

var router = express.Router();

router.post('/' , helper.firebasetoken ,async (req , res) => {
  const token = req.token;
  if(token && token != ''){
    try {
      await admin.auth().verifyIdToken(token).then(async (decodedToken) => {
        // console.log("decodedToken :",decodedToken);
        let primary =  mongoConnection.useDb(constants.DEFAULT_DB);
        let findUser = await primary.model(constants.MODELS.users , userModel).findOne({"mobile": decodedToken.phone_number}).lean();
        if(findUser == null){
          // console.log("decodedToken :",decodedToken);
          const obj = {
            fid: decodedToken.uid,
            mobile: decodedToken.phone_number,
            is_login: true
          }
          const newUser = await primary.model(constants.MODELS.users , userModel).create(obj);
          const token = jwt.sign({_id : newUser._id} , process.env.PRIVETKEY , {expiresIn: '30d'});
          const updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(newUser._id , {token: token} , {returnOriginal: false});
          data = {
            fid: updateUser.fid,
            is_subscriber: updateUser.is_subscriber,
            planName: updateUser.planName,
            token: updateUser.token
          }
          res.status(201).send({'status':201 , 'message': 'User created successfully...!' , "userdata": data});
        }else{
          const token = jwt.sign({_id : findUser._id} , process.env.PRIVETKEY , {expiresIn: '30d'});
          const updateUser = await primary.model(constants.MODELS.users , userModel).findByIdAndUpdate(findUser._id , {$set: {token: token , is_login: true}} , {returnOriginal: false});
          data = {
            fid: updateUser.fid,
            is_subscriber: updateUser.is_subscriber,
            planName: updateUser.planName,
            token: updateUser.token
          }
          return res.status(200).send({'status': 200 , 'message': 'Login successfully...!' , 'userdata':data});
        }
      }).catch(async (error) => {
        if(error.errorInfo.code === 'auth/id-token-expired'){          
          return res.status(401).send({'status':401 ,'message': 'Token expired...!'});
        }else{
          console.log("error :",error);
          res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
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