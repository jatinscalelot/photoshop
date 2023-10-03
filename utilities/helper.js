const jwt = require('jsonwebtoken');

const responseManager = require('./response.manager');

exports.firebasetoken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token = bearer[1].trim();
      if(token){
        req.token = token;
        next();
      }else{
        return responseManager.unauthorisedRequest(res);
      }
  } else {
      return responseManager.unauthorisedRequest(res);
  }
};

exports.authenticateToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    jwt.verify(token, process.env.PRIVETKEY, (err, auth) => {
      if (err) {
        return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
      } else {
        req.token = auth;
        req.Token = token;
      }
    });
    next();
  } else {
    return res.status(401).send({'status':401 ,'message': 'Unauthorized request...!'});
  }
};