const express = require("express")

const {httpGetAllUsers, httpCreateUser, httpDeleteUserById} = require("./users.controller");
const {createUserSchema} = require("../utils/validators/user.validator");
const validateRequest = require("../middleware/validate");


const routers = express.Router();

routers.get("/", httpGetAllUsers);
routers.post("/", validateRequest(createUserSchema), httpCreateUser);
routers.delete("/:id", httpDeleteUserById);


module.exports = routers;