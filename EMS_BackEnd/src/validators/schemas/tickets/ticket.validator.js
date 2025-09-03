import joi from 'joi';

export const createTicketSchema = joi.object({
    eventId: joi.string().required(),
    seatId: joi.string().required()
});

export const paymentSchema = joi.object({
    cardNumber: joi.string().length(16).pattern(/^\d+$/).required()
        .messages({
            'string.length': 'Card number must be 16 digits',
            'string.pattern.base': 'Card number must contain only digits'
        }),
    expiryDate: joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required()
        .messages({
            'string.pattern.base': 'Expiry date must be in MM/YY format'
        }),
    cvv: joi.string().length(3).pattern(/^\d+$/).required()
        .messages({
            'string.length': 'CVV must be 3 digits',
            'string.pattern.base': 'CVV must contain only digits'
        })
});