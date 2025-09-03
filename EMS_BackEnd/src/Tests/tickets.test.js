import request from 'supertest';
import app from '../app.js';
import { expect } from 'chai';
import mongoose from 'mongoose';
import Ticket from '../DB/Models/tickets.model.js';
import Event from '../DB/Models/events.model.js';
import User from '../DB/Models/users.model.js';
import Seat from '../DB/Models/seats.model.js';

describe('Tickets API', () => {
    let authToken;
    let eventId;
    let seatId;
    let ticketId;

    before(async () => {
        // Create test user and get token
        const userResponse = await request(app)
            .post('/api/users/signup')
            .send({
                name: 'Test User',
                email: 'test@tickets.com',
                password: 'Test123!'
            });
        
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@tickets.com',
                password: 'Test123!'
            });
        
        authToken = loginResponse.body.token;

        // Create test event
        const eventResponse = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Test Event',
                description: 'Test Description',
                date: '2024-12-31',
                location: 'Test Location',
                capacity: 100,
                price: 50,
                category: 'conference',
                bookingDeadline: '2024-12-30'
            });
        
        eventId = eventResponse.body.event._id;

        // Create test seat
        const seatResponse = await request(app)
            .post(`/api/events/${eventId}/seats`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                rowNumber: 1,
                seatNumber: 1,
                finalPrice: 50,
                category: 'standard'
            });
        
        seatId = seatResponse.body.seat._id;
    });

    describe('POST /api/tickets/event/:eventId/seat/:seatId', () => {
        it('should create a new ticket', async () => {
            const response = await request(app)
                .post(`/api/tickets/event/${eventId}/seat/${seatId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('ticket');
            expect(response.body.message).to.equal('Ticket created successfully');
            
            ticketId = response.body.ticket._id;
        });
    });

    describe('GET /api/tickets/:ticketId/qr', () => {
        it('should generate QR code for ticket', async () => {
            const response = await request(app)
                .get(`/api/tickets/${ticketId}/qr`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('qrCode');
            expect(response.body.message).to.equal('QR code generated successfully');
        });
    });

    after(async () => {
        // Cleanup test data
        await Ticket.deleteMany({});
        await Event.deleteMany({});
        await User.deleteMany({});
        await Seat.deleteMany({});
    });
});