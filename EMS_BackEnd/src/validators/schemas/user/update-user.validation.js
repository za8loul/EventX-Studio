import joi from "joi";

const namePattern = /^[A-Za-z\s'-]+$/;

const updateUserSchema = {
    body: joi.object({
        firstName: joi.string().trim().pattern(namePattern).min(2).max(25),
        lastName: joi.string().trim().pattern(namePattern).min(2).max(25),
        email: joi.string().trim().lowercase().email(),
        password: joi.string().min(6),
        age: joi.number().integer().min(18).max(100),
        gender: joi.string().trim().lowercase().valid('male', 'female'),
        role: joi.string().trim().lowercase().valid('admin', 'user')
    })
    .min(1)
    .options({ abortEarly: false, allowUnknown: false, stripUnknown: true })
};

export default updateUserSchema;