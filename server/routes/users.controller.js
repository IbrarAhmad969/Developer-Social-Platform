const { successResponse, errorResponse } = require("../utils/apiResponse");
const User = require("../models/users.model");
const ApiErrors = require("../utils/apiError");
const path = require("path");
const { uploadOnCloudinary } = require('../utils/cloudinary');
const jwt = require("jsonwebtoken");
const { oauth2Client } = require("../utils/oauth2client");
const { default: axios } = require("axios");
const crypto = require("crypto");
const ms = require("ms");



const accessAndRefreshTokenGenerator = async (userId) => {
  try {

    const user = await User.findById(userId);


    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiErrors("Something went wrong while generating Access and refresh tokens, try again", 500);
  }
}

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

    //1.

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

    console.log(avatarLocalPath);

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

    console.error("Signup error:", error.response?.data || error.message);

  }
};
const httpLoginUser = async (req, res) => {

  const { email, password, name } = req.body;

  if ([email, password].some((field) => field.trim() === '')) {
    throw new ApiErrors("All fields are required", 400);
  }

  const user = await User.findOne({
    email,
  })


  if (!user) {
    throw new ApiErrors("This user doesn't exist", 401);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    throw new ApiErrors("Password is incorrect, enter a valid password", 401);
  }

  // Setting cookies, for secure login/auth. 

  const { refreshToken, accessToken } = await accessAndRefreshTokenGenerator(user._id);

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  }

  return successResponse(res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options),
    {
      user: loggedInUser, accessToken, refreshToken,
    },
    "User Successfully LoggedIn. ",
    200
  )
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
const httpLogOutUser = async (req, res) => {
  // we need a user id. make a middleware. 
  try {

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined
        }
      },
      {
        new: true,

      }
    )

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    }

    return successResponse(
      res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options),
      {},
      "User Log out Successfully! "
    )

  } catch (error) {
    throw new ApiErrors("Can not logout, something went wrong", 400);
  }

}
const httpGenerateAccessToken = async (req, res, next) => {
  try {
    const incomingRequestToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRequestToken) {
      return next(new ApiErrors("UnAuthorize Request", 400));
    }

    const decodedToken = jwt.verify(incomingRequestToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if (!user) {
      throw new ApiErrors("Invalid Refresh Token", 401);
    }

    if (incomingRequestToken !== user?.refreshToken) {
      throw new ApiErrors("Refresh token is expired", 401);
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    }

    const { accessToken, refreshToken } = await accessAndRefreshTokenGenerator(user._id);
    return successResponse(
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options),
      {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
      "Access token generated successfully",
      200

    );

  } catch (error) {
    next(new ApiErrors("Something went wrong while generating Access token, user is not logged in" || error?.message, 500));

  }
}
const httpChangeCurrentPassword = async (req, res) => {

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)

  // check the password 

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiErrors("Invalid Password", 400);

  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return successResponse(
    res,
    {},
    "Changed Successfully",
    201,

  )

}
const httpGetCurrentUser = async (req, res) => {
  return successResponse(
    res,
    req.user,
    "Current User Found ",
    200,

  )
}

const httpUpdateAccountDetails = async (req, res) => {
  const { name, email } = req.body

  if (!(name) || !(email)) {
    throw new ApiErrors(
      "All fields are required",
      400,
    )
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        name,
        email, email,

      },

    },
    {
      new: true
    }
  ).select("-password")

  return successResponse(
    res,
    user,
    "Account details updated successfully",
    201,
  )
}

const httpUpdateUserAvatar = async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiErrors("Files path is missing", 400)
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiErrors("Error while uploading", 401)
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      }
    },
    {
      new: true
    }
  ).select("-password")

  return successResponse(res,
    user,
    "Avatar Updated Successfully"
  )
}

const httpUpdateUserCoverImage = async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiErrors("Files path is missing", 400)
  }

  const avatar = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar.url) {
    throw new ApiErrors("Error while uploading", 401)
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImageLocalPath.url,
      }
    },
    {
      new: true
    }
  ).select("-password")

  return successResponse(res,
    user,
    "Avatar Updated Successfully"
  )
}

const createSendToken = async (user, statusCode, res) => {
  console.log("create send token ")
  const { accessToken, refreshToken } = await accessAndRefreshTokenGenerator(user.id);

  console.log("after getting refresh token ")

  const cookieOption = {
    expires: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)),
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: "None",
  }

  user.password = undefined;

  console.log("Sending cookies ")

  res.cookie("accessToken", accessToken, cookieOption);
  res.cookie("refreshToken", refreshToken, cookieOption);


  console.log(user);

  res.status(statusCode).json({
    message: "Success",
    refreshToken,
    data: {
      user,
    }
  })
}

const googleAuth = async (req, res, next) => {

  const code = req.query.code;

  console.log(code);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userRes = await axios.get( // get the access and refresh tokens 
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`, {
        withCredentials: true
      }
    );

    let user = await User.findOne({
      email: userRes.data.email
    });

    if (!user) {
      console.log('New User found');
      user = await User.create({
        name: userRes.data.name,
        email: userRes.data.email,
        avatar: userRes.data.picture,
        role: "User",
        password: crypto.randomBytes(20).toString("hex"),
      });
    }

    createSendToken(user, 201, res);

  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
  httpUpdateUserById,
  httpLoginUser,
  httpLogOutUser,
  httpGenerateAccessToken,
  httpChangeCurrentPassword,

  httpGetCurrentUser,
  httpUpdateAccountDetails,
  httpUpdateUserAvatar,
  httpUpdateUserCoverImage,

  googleAuth,


};
