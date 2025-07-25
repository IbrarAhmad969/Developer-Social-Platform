const Joi = require("joi")

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    role: Joi.string().min(2).max(50).required(),

})
module.exports = {
    createUserSchema
}