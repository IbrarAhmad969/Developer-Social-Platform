const express = require("express");
const app = express();
const routers = require("./routes/users.route");
const errorHandler = require("./middleware/errorsHandler");

app.use(express.json());

app.use("/api/v1/users", routers);
app.use("/", (req, res) => {
  res.send("Welcome To the Express mode");
});

app.use(errorHandler);

module.exports = {
  app,
};
