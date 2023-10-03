let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
  fid: {
    type: String,
    require: true
  },
	mobile: {
		type: String,
		require: true
	},
  is_subscriber:{
    type: Boolean,
    default: false
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