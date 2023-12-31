let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
  fid: {
    type: String,
    unique: true,
    require: true
  },
	mobile: {
		type: String,
    unique: true,
		require: true
	},
  is_subscriber:{
    type: Boolean,
    default: false
  },
  pID: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  paymentID: {
    type: String,
    default: ''
  },
  planType: {
    type: Number,
    default: 0
  },
  planName: {
    type: String,
    default: "free"
  },
  token: {
    type: String,
    default: ''
  },
  status: {
    type:Boolean,
    default: true
  },
  is_login: {
    type:Boolean,
    default: false
  },
	createdBy: {
		type: mongoose.Types.ObjectId,
		default: null
	},
	updatedBy: {
		type: mongoose.Types.ObjectId,
		default: null
	}
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;