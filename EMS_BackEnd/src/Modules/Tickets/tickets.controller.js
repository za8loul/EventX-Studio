import { Router } from 'express';
import authenticationMiddleware from "../../Middlewares/auth.middleware.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import { createTicketSchema, paymentSchema } from "../../validators/schemas/tickets/ticket.validator.js";
import createTicketService from './Services/create-ticket.service.js';
import generateQRService from './Services/generate-qr.service.js';
import processPaymentService from './Services/process-payment.service.js';
import myTicketsService from './Services/my-tickets.service.js';

const ticketsController = Router();

ticketsController.post('/event/:eventId/seat/:seatId', 
    authenticationMiddleware, 
    validationMiddleware(createTicketSchema),
    createTicketService
);

ticketsController.get('/:ticketId/qr', authenticationMiddleware, generateQRService);
ticketsController.post('/:ticketId/pay', 
    authenticationMiddleware, 
    validationMiddleware(paymentSchema),
    processPaymentService
);
ticketsController.get('/my-tickets', authenticationMiddleware, myTicketsService);

export default ticketsController;