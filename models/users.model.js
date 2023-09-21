let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	fname: {
		type: String, 
		required:true, 
		trim:true
	},
	lname: {
		type: String, 
		required:true, 
		trim:true
	},
	email: {
		type:String,
    required:true, 
    unique:true
	},
  emailOTP: {
    type:String,
    required:true
  },
	password: {
		type:String,
		required:true
	},
  is_email_verified: {
		type:Boolean,
    default: false
	},
	tc: {
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