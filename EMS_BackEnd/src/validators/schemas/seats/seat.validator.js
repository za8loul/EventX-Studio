import joi from 'joi';

export const createSeatSchema = joi.object({
    rowNumber: joi.number().integer().min(1).required(),
    seatNumber: joi.number().integer().min(1).required(),
    category: joi.string().valid('standard', 'premium', 'vip', 'accessible').required(),
    finalPrice: joi.number().min(0).required(),
    features: joi.array().items(joi.string())
});

export const generateSeatsSchema = joi.object({
    rows: joi.number().integer().min(1).required(),
    seatsPerRow: joi.number().integer().min(1).required(),
    basePrice: joi.number().min(0),
    category: joi.string().valid('standard', 'premium', 'vip', 'accessible'),
    features: joi.array().items(joi.string()),
    finalPrice: joi.number().min(0).required()
});