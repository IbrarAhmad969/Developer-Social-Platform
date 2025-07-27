const { app } = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./db/index");

dotenv.config();

const port = process.env.PORT || 3000;

function startServer() {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server is Listening at PORT ${port}`);
    });
  });
}
startServer();
