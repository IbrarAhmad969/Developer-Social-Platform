const {errorResponse} = require("../utils/apiResponse")

function errorHandler(err, req, res, next){
    
    const status = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return errorResponse(res, message, status);

}
module.exports = errorHandler;
