const User = require("../models/users.model");
const ApiErrors = require("../utils/apiError");
const jwt = require("jsonwebtoken");

const verifyJwt = async (req, res, next) => {
 
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    if (!token) {
      throw new ApiErrors("UnAuthorized request", 401);
    }

    console.log("before decoded jwt verify");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded token", decodedToken);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiErrors("Invalid Access token provided", 402);
    }

    req.user = user;

    next();
  } catch (error) {
    next(new ApiErrors("User is not Logged in", 401));
  }
};
module.exports = verifyJwt;
