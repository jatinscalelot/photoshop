const admin = require('firebase-admin');
const serverAccount = require('../photoshoptutor-be592-firebase-adminsdk-net7t-f74d88bb2a.json');

admin.initializeApp({
  credential: admin.credential.cert(serverAccount)
});

module.exports = admin;