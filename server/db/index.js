const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");
const {DB_NAME} = require("../constants");

const connectDB = async () => {
  try {
    const connResponse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MonoDB connected at : ${connResponse.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection Error ${error.message}`);
    throw new ApiError("Cannot Connect to DB", 401);
  }
};

module.exports = connectDB;
