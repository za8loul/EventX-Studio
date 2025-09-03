import joi from "joi";

const namePattern = /^[A-Za-z\s'-]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^._-]).{8,}$/;

const signupSchema = joi.object({
    firstName: joi.string().trim().pattern(namePattern).min(2).max(25).required().messages({
        'string.base': 'First name must be a string',
        'string.empty': 'First name cannot be empty',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 25 characters',
        'string.pattern.base': 'First name may contain only letters, spaces, apostrophes, and dashes'
    }),
    lastName: joi.string().trim().pattern(namePattern).min(2).max(25).required().messages({
        'string.base': 'Last name must be a string',
        'string.empty': 'Last name cannot be empty',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 25 characters',
        'string.pattern.base': 'Last name may contain only letters, spaces, apostrophes, and dashes'
    }),
    email: joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email cannot be empty'
    }),
    password: joi.string().pattern(passwordPattern).required().messages({
        'string.pattern.base': 'Password must contain at least 8 characters, including one letter, one number, and one special character',
        'string.empty': 'Password cannot be empty'
    }),
    gender: joi.string().valid('male', 'female').required().messages({
        'any.only': 'Gender must be either male or female',
        'string.empty': 'Gender cannot be empty'
    }),
    age: joi.number().integer().min(18).max(100).required().messages({
        'number.base': 'Age must be a number',
        'number.min': 'Age must be at least 18 years old',
        'number.max': 'Age must be at most 100 years old'
    })
}).options({ abortEarly: false, allowUnknown: false, stripUnknown: true });

export default signupSchema;

