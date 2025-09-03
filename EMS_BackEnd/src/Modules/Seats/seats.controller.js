import { Router } from "express";
import authenticationMiddleware from "../../Middlewares/auth.middleware.js";
import { requirePermission, requireAdmin } from "../../Middlewares/authorization.middleware.js"; // Fixed import
import { PERMISSIONS } from "../../DB/Models/users.model.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";

// Services
import createSeatService from "./Services/create-seat.service.js";
import generateSeatsService from "./Services/generate-seats.service.js";
import getEventSeatsService from "./Services/get-event-seats.service.js";
import updateSeatService from "./Services/update-seat.service.js";
import deleteSeatService from "./Services/delete-seat.service.js";
import selectSeatsService from "./Services/select-seats.service.js";
import releaseSeatsService from "./Services/release-seats.service.js";

const seatsController = Router();

// Public routes
seatsController.get('/event/:eventId', getEventSeatsService);

// Admin routes (ADMIN ONLY)
seatsController.post('/event/:eventId/generate', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_EVENT), generateSeatsService);
seatsController.post('/event/:eventId', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_EVENT), createSeatService);
seatsController.put('/:seatId', authenticationMiddleware, requirePermission(PERMISSIONS.UPDATE_EVENT), updateSeatService);
seatsController.delete('/:seatId', authenticationMiddleware, requirePermission(PERMISSIONS.DELETE_EVENT), deleteSeatService);

// User routes (authenticated users)
seatsController.post('/select', authenticationMiddleware, requirePermission(PERMISSIONS.BOOK_EVENT), selectSeatsService);
seatsController.post('/release', authenticationMiddleware, requirePermission(PERMISSIONS.BOOK_EVENT), releaseSeatsService);

export default seatsController;
