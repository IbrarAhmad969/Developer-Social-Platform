const { successResponse, errorResponse } = require("../utils/apiResponse");
const User = require("../models/users.model");
const ApiErrors = require("../utils/apiError");
const path = require("path"); // make sure this is at the top

const { uploadOnCloudinary } = require('../utils/cloudinary');

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
};

const httpCreateUser = async (req, res, next) => {

  try {
    // get user data
    // validation of fields
    // check if already exists
    // upload files using avatar and cover image
    // check for the image if uploaded or not
    // create user object
    // send the response without password
    // check if user is created or not send the error Response
    // return response to the user?

    const { name, email, role, password } = req.body;

    //2.

    if ([name, email, role, password].some((field) => field.trim() === "")) {
      throw new ApiErrors("All fields are mandatory", 400);
    }
    //3.

    const existedUser = await User.findOne({
      $or: [{ email }]
    })

    if (existedUser) {
      throw new ApiErrors("User already existed", 409);
    }

    //4. upload 

    const avatarLocalPath = req.files?.avatar[0].path
    const coverLocalImage = req.files?.coverImage?.length ? req.files.coverImage[0].path : undefined;

    if (!avatarLocalPath) {
      throw new ApiErrors("Avatar is required", 409);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImag = await uploadOnCloudinary(coverLocalImage);

    // error. 

    if (!avatar) {
      throw new ApiErrors("Unable to upload the file", 400);
    }

    // create a user now. 

    const newUser = await User.create({
      name,
      avatar: avatar.url,
      coverImage: coverImag?.url || "",
      email,
      role,
      password,
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

    if (!createdUser) {
      throw new ApiErrors("Something went wrong while registering User", 500);
    }

    return successResponse(res, createdUser, "User Registered Successfully");

  } catch (error) {
    next(error);
  }
};
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
};
const httpUpdateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const { name, role } = req.body;

    if (!name && !role) {
      throw new ApiErrors("provide name or role", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { ...(name && { name }), ...(role && { role }) } },
      { new: true, runValidator: true }
    );

    if (!updatedUser) {
      throw new ApiErrors("User not Found ", 404);
    }

    return successResponse(res, updatedUser, "User Updated Successfully ");
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ApiErrors("Oops! That user ID doesn't look right", 400));
    }
    next(error);
  }
};

module.exports = {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
  httpUpdateUserById,
};
