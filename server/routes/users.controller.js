const { successResponse } = require("../utils/apiResponse");
const User = require("../models/users.model");
const ApiErrors = require("../utils/apiError");

//Get Method to Get the Users. 

const httpGetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users.length) {
      throw new ApiErrors("No users found", 404);
    }

    return successResponse(res, users, "Users Fetched Successfully");
  } catch (error) {
    next(error);
  }
}

const httpCreateUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;

    const newUser = await User.create({ name, role });
    return successResponse(res, newUser, "User Created Successfully ", 201);
  } catch (error) {
    next(error);
  }
}
const httpDeleteUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deleted = await User.findByIdAndDelete(userId);

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiErrors("Invalid User ID format", 400);
    }  
    if (!deleted) {
      throw new ApiErrors("User not found", 404);
    }

    return successResponse(res, null, "User deleted Successfully");
  } catch (error) {
    next(error);
  }
}
const httpUpdateUserById = async(req, res, next) =>{
  try {
    const userId = req.params.id;

    const {name, role} = req.body; 

    if(!name && !role){
      throw new ApiErrors("provide name or role", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {$set: {...(name && {name}), ...(role && {role})}}, 
      {new: true, runValidator: true}
    );

    if(!updatedUser){
      throw new ApiErrors("User not Found ", 404);
    }

    return successResponse(res, updatedUser, "User Updated Successfully ");


    
  } catch (error) {
    if(error.name === "CastError"){
      return next(new ApiErrors("Oops! That user ID doesn't look right", 400));
    }
    next(error);
  }
}

module.exports = {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
  httpUpdateUserById,
};
