import joi from "joi";

const loginSchema = joi.object({
    email: joi.string().trim().lowercase().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email cannot be empty'
    }),
    password: joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password cannot be empty'
    })
}).options({
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
});

export default loginSchema;