const Joi = require("joi")

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    role: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).required(),
    avatar: Joi.string().required(),
    coverImage: Joi.string().required(),

})
module.exports = {
    createUserSchema
}