
function validateRequest(schema){
    return (req, res, next)=>{
        
        const {error} = schema.validate(req.body);
        if(error){
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            })
        }
        next();
    }
}

module.exports = validateRequest;
