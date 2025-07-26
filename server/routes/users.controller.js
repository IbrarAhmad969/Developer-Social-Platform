const { getAllUsers, createUser, deleteUserById } = require("../models/users.model");
const { successResponse } = require("../utils/apiResponse");
const ApiErrors = require("../utils/apiError");

function httpGetAllUsers(req, res, next) {
  try {
    const users = getAllUsers();

    if (!users.length) {
      throw new ApiErrors("No users found", 404);
    }

    return successResponse(res, users, "Users Fetched Successfully");
  } catch (error) {
    next(error);
  }
}

function httpCreateUser(req, res, next) {
  try {
    const { name, role } = req.body;

    const newUser = createUser({ name, role });
    return successResponse(res, newUser, "User Created Successfully ", 201);
  } catch (error) {
    next(error);
  }
}
function httpDeleteUserById(req, res, next) {
  try {
    const userId = +req.params.id;

    if (isNaN(userId)) {
      throw new ApiErrors("Invalid User ID", 400);
    }

    const deleted = deleteUserById(userId);

    if (!deleted) {
      throw new ApiErrors("User not found", 404);
    }

    return successResponse(res, null, "User deleted Successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
};
