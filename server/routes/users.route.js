const express = require("express");
const upload = require("../middleware/multer.middleware")
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

routers.post("/", upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), httpCreateUser);

routers.delete("/:id", httpDeleteUserById);
routers.put("/:id", httpUpdateUserById);

module.exports = routers;
