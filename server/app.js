const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const routers = require("./routes/users.route");
const errorHandler = require("./middleware/errorsHandler");
const cors = require("cors");


app.use(cors({
  origin: ["*", "http://localhost:8000", "https://furniture-showroom-one.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,

}))

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", routers);

app.use("/", (req, res) => {
  res.send("Welcome To the Express mode");
});


app.use(errorHandler);

module.exports = {
  app,
};
