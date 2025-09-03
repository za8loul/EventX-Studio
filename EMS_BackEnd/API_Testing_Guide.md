# EMS Seat Allocation API Testing Guide

This guide provides comprehensive testing instructions for the Event Management System (EMS) seat allocation and events API endpoints using Postman.

## 🚀 Quick Start

1. **Import the Postman Collection**: Import `EMS_Seat_Allocation_API_Tests.postman_collection.json` into Postman
2. **Set Environment Variables**: Configure the base URL and tokens
3. **Follow the Test Flow**: Execute requests in the recommended order

## 📋 Prerequisites

- EMS Backend server running on `http://localhost:3000` (or update `base_url` variable)
- MongoDB database connected
- Postman installed

## 🔐 Authentication Setup

### Step 1: Create Test Users

#### Admin User Signup
```bash
POST {{base_url}}/users/signup
Content-Type: application/json

{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@test.com",
    "password": "Admin123!",
    "gender": "male",
    "age": 30,
    "role": "admin"
}
```

#### Regular User Signup
```bash
POST {{base_url}}/users/signup
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "password": "User123!",
    "gender": "male",
    "age": 25,
    "role": "user"
}
```

### Step 2: Login and Get Tokens

#### Admin Login
```bash
POST {{base_url}}/users/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "Admin123!"
}
```

**Response**: Copy the `token` value to `{{admin_token}}` variable

#### User Login
```bash
POST {{base_url}}/users/login
Content-Type: application/json

{
    "email": "john.doe@test.com",
    "password": "User123!"
}
```

**Response**: Copy the `token` value to `{{user_token}}` variable

## 🎭 Complete Test Flow

### Phase 1: Event Creation (Admin)

#### 1. Create Event
```bash
POST {{base_url}}/events
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "title": "Test Concert 2024",
    "description": "A fantastic test concert for seat allocation testing",
    "date": "2024-12-31T20:00:00.000Z",
    "location": "Test Arena, Test City",
    "capacity": 100,
    "price": 50,
    "category": "concert",
    "bookingDeadline": "2024-12-30T20:00:00.000Z",
    "refundPolicy": "No refunds within 24 hours of event"
}
```

**Response**: Copy the `event._id` value to `{{event_id}}` variable

#### 2. Generate Seats for Event
```bash
POST {{base_url}}/seats/event/{{event_id}}/generate
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "rows": 10,
    "seatsPerRow": 10,
    "basePrice": 50,
    "category": "standard",
    "features": ["near_stage", "center"]
}
```

**Expected Response**:
```json
{
    "message": "100 seats generated successfully for event",
    "seatsGenerated": 100,
    "rows": 10,
    "seatsPerRow": 10,
    "seats": [...]
}
```

#### 3. Verify Seat Generation
```bash
GET {{base_url}}/seats/event/{{event_id}}
```

**Expected Response**: 100 seats with different categories:
- **Premium seats** (rows 1-2): 20 seats with 1.5x price multiplier
- **Good seats** (rows 3-4): 20 seats with 1.2x price multiplier  
- **Standard seats** (rows 5-10): 60 seats with 1.0x price multiplier

### Phase 2: Seat Selection & Booking (User)

#### 1. View Available Seats
```bash
GET {{base_url}}/seats/event/{{event_id}}
```

**Response**: Copy two available seat IDs to `{{seat_id_1}}` and `{{seat_id_2}}` variables

#### 2. Select Seats (Reserve for 15 minutes)
```bash
POST {{base_url}}/seats/select
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
    "eventId": "{{event_id}}",
    "selectedSeats": [
        {"seatId": "{{seat_id_1}}"},
        {"seatId": "{{seat_id_2}}"}
    ],
    "numberOfTickets": 2
}
```

**Expected Response**:
```json
{
    "message": "Seats reserved successfully for 15 minutes",
    "reservedSeats": [...],
    "totalPrice": 125,
    "reservationExpiry": "2024-01-15T10:30:00.000Z",
    "nextStep": "Complete your booking within 15 minutes"
}
```

#### 3. Book Event with Selected Seats
```bash
POST {{base_url}}/events/{{event_id}}/book
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
    "numberOfTickets": 2,
    "paymentMethod": "credit_card",
    "specialRequests": "Please ensure seats are together",
    "selectedSeats": [
        {"seatId": "{{seat_id_1}}"},
        {"seatId": "{{seat_id_2}}"}
    ]
}
```

**Expected Response**:
```json
{
    "message": "Event booked successfully",
    "booking": {...},
    "selectedSeats": [...],
    "event": {...}
}
```

### Phase 3: Advanced Testing

#### 1. Test Seat Release
```bash
POST {{base_url}}/seats/release
Authorization: Bearer {{user_token}}
Content-Type: application/json

{
    "eventId": "{{event_id}}",
    "seatIds": ["{{seat_id_1}}", "{{seat_id_2}}"]
}
```

#### 2. Test Concurrent Seat Selection
Create two separate Postman tabs and execute seat selection requests simultaneously to test race condition handling.

#### 3. Test Invalid Scenarios
- Try to select already booked seats
- Use invalid event IDs
- Test with expired tokens
- Attempt to book more seats than available

## 🧪 Test Scenarios

### Scenario 1: Complete User Journey
1. User signup → User login → Browse events → Select seats → Book event
2. **Expected**: Successful booking with seat confirmation

### Scenario 2: Admin Event Management
1. Admin login → Create event → Generate seats → Update event → Delete event
2. **Expected**: Full CRUD operations successful

### Scenario 3: Seat Category Pricing
1. Generate seats with different categories
2. Verify premium seats cost more than standard seats
3. **Expected**: Price multipliers correctly applied

### Scenario 4: Reservation Timeout
1. Select seats and wait 15+ minutes
2. Try to book with expired reservation
3. **Expected**: Seats automatically released, booking fails

### Scenario 5: Concurrent Booking
1. Two users try to select the same seat simultaneously
2. **Expected**: One succeeds, one fails (race condition handled)

## 📊 Response Validation

### Success Responses
- **Status Codes**: 200 (OK), 201 (Created)
- **Response Format**: JSON with `message` field
- **Data Structure**: Consistent with API documentation

### Error Responses
- **Status Codes**: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)
- **Error Format**: JSON with `message` and optional `error` fields

### Common Validation Rules
- Required fields present
- Data types correct
- Business logic constraints satisfied
- Authorization properly enforced

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Problem**: 401 Unauthorized responses
- **Solution**: Verify token is valid and not expired
- **Check**: Token format, expiration time, user permissions

#### 2. Validation Errors
- **Problem**: 400 Bad Request responses
- **Solution**: Check request body against validation schemas
- **Check**: Required fields, data types, business rules

#### 3. Database Connection Issues
- **Problem**: 500 Internal Server Error
- **Solution**: Verify MongoDB connection
- **Check**: Database status, connection string, network

#### 4. Permission Denied
- **Problem**: 403 Forbidden responses
- **Solution**: Verify user role and permissions
- **Check**: User role, required permissions, middleware configuration

### Debug Steps
1. Check server logs for detailed error messages
2. Verify request headers and body format
3. Test with Postman console for request/response details
4. Use database tools to verify data state
5. Check middleware execution order

## 📝 Test Data Management

### Test Users
- **Admin**: Full system access, can create/manage events and seats
- **Regular User**: Can browse events, select seats, and make bookings

### Test Events
- **Future dates**: Ensure events are in the future for booking
- **Realistic data**: Use proper venue names, descriptions, and pricing
- **Varied categories**: Test different event types and configurations

### Test Seats
- **Multiple configurations**: Test different row/seat combinations
- **Price variations**: Verify category-based pricing works
- **Feature combinations**: Test various seat features and accessibility options

## 🎯 Performance Testing

### Load Testing
- **Concurrent users**: Test with multiple simultaneous requests
- **Database performance**: Monitor query execution times
- **Memory usage**: Check for memory leaks during seat generation

### Stress Testing
- **Large events**: Generate 1000+ seats
- **High concurrency**: Multiple users selecting seats simultaneously
- **Long-running operations**: Test seat generation for large venues

## 📚 Additional Resources

- **API Documentation**: Check inline code comments
- **Database Schema**: Review MongoDB models
- **Middleware**: Understand authentication and authorization flow
- **Validation**: Check Joi validation schemas

## 🚨 Security Testing

### Authentication
- Test with invalid tokens
- Test with expired tokens
- Test with malformed authorization headers

### Authorization
- Test admin-only endpoints with regular users
- Test user endpoints with admin accounts
- Verify permission-based access control

### Input Validation
- Test with malformed JSON
- Test with SQL injection attempts
- Test with oversized payloads

---

**Note**: This testing guide assumes the EMS backend is properly configured and running. Adjust base URLs, database connections, and environment variables as needed for your specific setup.
