function successResponse(res, data, message="Success", statusCode = 200){
    return res.status(statusCode).json({
        status: "Success", 
        message,
        data
    })
}

function errorResponse(res, message = "Something wrong", status=500){
    return res.status(statusCode).json({
        status: "error", 
        message,
    })
}

module.exports = {
    successResponse,
    errorResponse,
}