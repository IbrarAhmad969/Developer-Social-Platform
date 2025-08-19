const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const routers = require("./routes/users.route");
const errorHandler = require("./middleware/errorsHandler");

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", routers);
app.use("/", (req, res) => {
  res.send("Welcome To the Express mode");
});

app.get("/", (req, res) => {
  res.send("Hello from Vercel backend 🚀");
});


app.get("/api/products", (req, res)=>{
  res.json([
    {
      id: 1, 
      name: "Ibrar"
    }
  ])
})

app.use(errorHandler);

module.exports = {
  app,
};
