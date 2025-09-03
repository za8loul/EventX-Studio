/**
 * Validates data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
const validateSchema = (schema, data) => {
    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        errors: {
            wrap: {
                label: ''
            }
        }
    });
};

export default validateSchema;