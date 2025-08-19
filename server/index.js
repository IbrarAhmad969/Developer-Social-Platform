require("dotenv").config();
const { app } = require("./app");
const connectDB = require("./db/index");


const port = process.env.PORT || 3000;


function startServer() {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is Listening at PORT ${port}`);
    });
  });
}
startServer();
