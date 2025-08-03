const { mongoose, Schema } = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({

  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String, 
    required: [true, 'Email is required']
  },
  role: {
    type: String,
    required: [true, "Role is required"],
  },
  coverImage: {
    type: String,
  },
  avatar: {
    type: String,
    required: true
  },

  password: {
    type: String,
    require: [true, "Password is missing "]
  },
  refreshToken: {
    type: String, 
  }

}, { timestamps: true });

//this is pre built in hook which will check if the password is yet modified or not. 

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()

})
// these are now methods on the model 

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function(){
  return jwt.sign(
    {
      _id: this.id,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

userSchema.methods.generateRefreshToken = async function(){
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}

const User = mongoose.model('User', userSchema);

module.exports = User;
