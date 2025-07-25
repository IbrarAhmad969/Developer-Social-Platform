const { getAllUsers, createUser } = require("../models/users.model");
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
        next(error)
    }
}

function httpCreateUser(req, res, next){
    try {
        const {name, role } = req.body;

        const newUser = createUser({name, role});
        return successResponse(res, newUser, "User Created Successfully ", 201);
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    httpGetAllUsers,
    httpCreateUser,
}