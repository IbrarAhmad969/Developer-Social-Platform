require("dotenv").config();
const { app } = require("../server/app");
const connectDB = require("../server/db/index");


const port = process.env.PORT || 3000;


function startServer() {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is Listening at PORT ${port}`);
    });
  });
}
startServer();
