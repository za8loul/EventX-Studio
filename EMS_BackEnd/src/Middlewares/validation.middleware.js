import  validateSchema  from '../Utils/schema.validator.js';

/**
 * Middleware to validate request data against a schema
 * @param {Object} schema - Joi schema object with body, query, params properties
 */
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        // Extract the appropriate schema based on request type
        const schemaToValidate = schema.body || schema.query || schema.params || schema;
        
        const validationResult = validateSchema(schemaToValidate, req.body);
        
        if (validationResult.error) {
            const errors = validationResult.error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                status: 'error',
                message: 'Validation Error',
                errors
            });
        }

        // Add validated data to request
        req.validatedData = validationResult.value;
        next();
    };
};

export default validationMiddleware;
