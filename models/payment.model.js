let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
  fid: {
    type: String,
    require: true
  },
  userid: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  amount: {
    type: Number,
    require: true
  },
  planType: {
    type: String,
    require: true
  },
  planName: {
    type: String,
    require: true
  },
  startDate: {
    type: Date,
    require: true
  },
  endDate: {
    type: Date,
    require: true
  },
  startDate_timestamp: {
    type: Number,
    require: true
  },
  endDate_timestamp: {
    type: Number,
    require: true
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