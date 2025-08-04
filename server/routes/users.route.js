const express = require("express");
const upload = require("../middleware/multer.middleware")
const verifyJwt = require("../middleware/auth.middleware");

const {
  httpGetAllUsers,
  httpCreateUser,
  httpDeleteUserById,
  httpUpdateUserById,
  httpLoginUser,
  httpLogOutUser,
} = require("./users.controller");
const { createUserSchema } = require("../utils/validators/user.validator");
const validateRequest = require("../middleware/validate");

const routers = express.Router();

routers.get("/", httpGetAllUsers);

routers.post("/loginUser", httpLoginUser);
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

routers.post("/logout", verifyJwt, httpLogOutUser);
routers.delete("/:id", httpDeleteUserById);
routers.put("/:id", httpUpdateUserById);

module.exports = routers;
