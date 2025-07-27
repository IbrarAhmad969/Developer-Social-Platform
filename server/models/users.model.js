const {mongoose, Schema} = require("mongoose")

const userSchema = new Schema({

  name: {
    type: String,
    required: [true, 'Name is Required']
  },
  role: {
    type: String,
    required: [true, "Role is Required"],
  }

}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;
