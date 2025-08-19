const serverless = require("serverless-http");
const { app } = require("../server/app");
const connectDB = require("../server/db/index");

// connect DB before handling requests
let isConnected = false;
async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  const wrapped = serverless(app);
  return wrapped(req, res);
}

module.exports = handler;
