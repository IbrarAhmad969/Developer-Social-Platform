const express = require("express");

const {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
  httpUpdateUserById,
} = require("./users.controller");
const { createUserSchema } = require("../utils/validators/user.validator");
const validateRequest = require("../middleware/validate");

const routers = express.Router();

routers.get("/", httpGetAllUsers);
routers.post("/", validateRequest(createUserSchema), httpCreateUser);
routers.delete("/:id", httpDeleteUserById);
routers.put("/:id", httpUpdateUserById);

module.exports = routers;
