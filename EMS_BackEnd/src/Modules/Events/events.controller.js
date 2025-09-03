import { Router } from "express";
import authenticationMiddleware from "../../Middlewares/auth.middleware.js";
import { requirePermission, requireAdmin } from "../../Middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../DB/Models/users.model.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import { createEventSchema, updateEventSchema } from "../../validators/schemas/events/event.validator.js";

// Services
import getPublishedEventsService from "./Services/get-published-events.service.js";
import getEventByIdService from "./Services/get-event-by-id.service.js";
import createEventService from "./Services/create-event.service.js";
import updateEventService from "./Services/update-event.service.js";
import deleteEventService from "./Services/delete-event.service.js";
import bookEventService from "./Services/book-event.service.js";
import cancelBookingService from "./Services/cancel-booking.service.js";
import getMyBookingsService from "./Services/get-my-bookings.service.js";
import adminGetAllEventsService from "./Services/admin-get-all-events.service.js";
import adminGetEventBookingsService from "./Services/admin-get-event-bookings.service.js";
import seatAllocationService from "./Services/seat-allocation.service.js";
import generateSeatsService from "./Services/generate-seats.service.js";
import getEventSeatsService from "./Services/get-event-seats.service.js";
import browseEventsService from './Services/browse-events.service.js';
import eventDetailsService from './Services/event-details.service.js';
import adminGetAllBookingsService from './Services/admin-get-all-bookings.service.js';
import selectSeatsService from "../Seats/Services/select-seats.service.js";

const eventsController = Router();

// Get all published events (public)
eventsController.get('/', getPublishedEventsService);

// Browse events with filters (public)
eventsController.get('/browse', browseEventsService);

// Get event details (public)
eventsController.get('/:id/details', eventDetailsService);

// Get user's bookings (USER - requires VIEW_BOOKINGS permission)
eventsController.get('/my-bookings', authenticationMiddleware, requirePermission(PERMISSIONS.VIEW_BOOKINGS), getMyBookingsService);

// Admin routes for managing all events
eventsController.get('/admin/all', authenticationMiddleware, requireAdmin, adminGetAllEventsService);

// Create event (ADMIN ONLY - requires CREATE_EVENT permission)
eventsController.post('/', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_EVENT), validationMiddleware(createEventSchema), createEventService);

// Update event (ADMIN ONLY - requires UPDATE_EVENT permission)
eventsController.put('/:id', authenticationMiddleware, requirePermission(PERMISSIONS.UPDATE_EVENT), validationMiddleware(updateEventSchema), updateEventService);

// Delete event (ADMIN ONLY - requires DELETE_EVENT permission)
eventsController.delete('/:id', authenticationMiddleware, requirePermission(PERMISSIONS.DELETE_EVENT), deleteEventService);

// Book event (USER - requires BOOK_EVENT permission)
eventsController.post('/:id/book', authenticationMiddleware, requirePermission(PERMISSIONS.BOOK_EVENT), bookEventService);

// Reserve seats (USER - requires BOOK_EVENT permission)
eventsController.post('/:id/seats/reserve', authenticationMiddleware, requirePermission(PERMISSIONS.BOOK_EVENT), selectSeatsService);

// Cancel booking (USER - requires CANCEL_BOOKING permission)
eventsController.post('/:id/cancel-booking', authenticationMiddleware, requirePermission(PERMISSIONS.CANCEL_BOOKING), cancelBookingService);

// Admin route to view all bookings for an event
eventsController.get('/admin/:id/bookings', authenticationMiddleware, requireAdmin, adminGetEventBookingsService);

// Admin route to view all bookings for all events
eventsController.get('/admin/all-bookings', authenticationMiddleware, requireAdmin, adminGetAllBookingsService);

// Seat management routes (ADMIN ONLY) - These MUST come BEFORE the generic /:id route
eventsController.post('/:id/seats', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_EVENT), seatAllocationService);
eventsController.post('/:id/seats/generate', authenticationMiddleware, requirePermission(PERMISSIONS.CREATE_EVENT), generateSeatsService);
eventsController.get('/:id/seats', getEventSeatsService); // Public - for viewing seat layout

// Get event by ID (public) - This MUST come LAST, after all specific routes
eventsController.get('/:id', getEventByIdService);

export default eventsController;
