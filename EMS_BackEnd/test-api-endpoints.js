/**
 * Simple API Test Script for EMS Seat Allocation System
 * Run this script to test basic API connectivity and functionality
 */

import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_DATA = {
    admin: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        password: "Admin123!",
        gender: "male",
        age: 30,
        role: "admin"
    },
    regularUser: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@test.com",
        password: "User123!",
        gender: "male",
        age: 25,
        role: "user"
    },
    event: {
        title: "Test Concert 2024",
        description: "A fantastic test concert for seat allocation testing",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        location: "Test Arena, Test City",
        capacity: 100,
        price: 50,
        category: "concert",
        bookingDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        refundPolicy: "No refunds within 24 hours of event",
        seatingLayout: {
            type: "theater",
            rows: 10,
            seatsPerRow: 10
        }
    }
};

// Global variables to store test results
let adminToken = '';
let userToken = '';
let eventId = '';
let seatIds = [];

// Utility function for making HTTP requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 'ERROR', data: { error: error.message } };
    }
}

// Test functions
async function testUserSignup() {
    console.log('🔐 Testing User Signup...');
    
    const response = await makeRequest(`${BASE_URL}/users/signup`, {
        method: 'POST',
        body: JSON.stringify(TEST_DATA.regularUser)
    });
    
    if (response.status === 201) {
        console.log('✅ User signup successful');
        return true;
    } else {
        console.log('❌ User signup failed:', response.data);
        return false;
    }
}

async function testAdminSignup() {
    console.log('🔐 Testing Admin Signup...');
    
    const response = await makeRequest(`${BASE_URL}/users/signup`, {
        method: 'POST',
        body: JSON.stringify(TEST_DATA.admin)
    });
    
    if (response.status === 201) {
        console.log('✅ Admin signup successful');
        return true;
    } else {
        console.log('❌ Admin signup failed:', response.data);
        return false;
    }
}

async function testUserLogin() {
    console.log('🔐 Testing User Login...');
    
    const response = await makeRequest(`${BASE_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: TEST_DATA.regularUser.email,
            password: TEST_DATA.regularUser.password
        })
    });
    
    if (response.status === 200 && response.data.token) {
        userToken = response.data.token;
        console.log('✅ User login successful');
        return true;
    } else {
        console.log('❌ User login failed:', response.data);
        return false;
    }
}

async function testAdminLogin() {
    console.log('🔐 Testing Admin Login...');
    
    const response = await makeRequest(`${BASE_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: TEST_DATA.admin.email,
            password: TEST_DATA.admin.password
        })
    });
    
    if (response.status === 200 && response.data.token) {
        adminToken = response.data.token;
        console.log('✅ Admin login successful');
        return true;
    } else {
        console.log('❌ Admin login failed:', response.data);
        return false;
    }
}

async function testCreateEvent() {
    console.log('🎭 Testing Event Creation...');
    
    const response = await makeRequest(`${BASE_URL}/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(TEST_DATA.event)
    });
    
    if (response.status === 201 && response.data.event) {
        eventId = response.data.event._id;
        console.log('✅ Event creation successful, ID:', eventId);
        return true;
    } else {
        console.log('❌ Event creation failed:', response.data);
        return false;
    }
}

async function testGenerateSeats() {
    console.log('💺 Testing Seat Generation...');
    
    const response = await makeRequest(`${BASE_URL}/seats/event/${eventId}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
            rows: 10,
            seatsPerRow: 10,
            basePrice: 50,
            category: "standard",
            features: ["near_stage", "center"]
        })
    });
    
    if (response.status === 201) {
        console.log('✅ Seat generation successful');
        return true;
    } else {
        console.log('❌ Seat generation failed:', response.data);
        return false;
    }
}

async function testGetEventSeats() {
    console.log('💺 Testing Get Event Seats...');
    
    const response = await makeRequest(`${BASE_URL}/seats/event/${eventId}`);
    
    if (response.status === 200 && response.data.seats) {
        seatIds = response.data.seats.slice(0, 2).map(seat => seat._id);
        console.log(`✅ Retrieved ${response.data.seats.length} seats`);
        console.log(`   - Premium seats: ${response.data.seats.filter(s => s.category === 'premium').length}`);
        console.log(`   - Good seats: ${response.data.seats.filter(s => s.category === 'good').length}`);
        console.log(`   - Standard seats: ${response.data.seats.filter(s => s.category === 'standard').length}`);
        return true;
    } else {
        console.log('❌ Get event seats failed:', response.data);
        return false;
    }
}

async function testSelectSeats() {
    console.log('🎯 Testing Seat Selection...');
    
    if (seatIds.length < 2) {
        console.log('❌ Not enough seats available for testing');
        return false;
    }
    
    const response = await makeRequest(`${BASE_URL}/seats/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
            eventId: eventId,
            selectedSeats: seatIds.map(id => ({ seatId: id })),
            numberOfTickets: 2
        })
    });
    
    if (response.status === 200) {
        console.log('✅ Seat selection successful');
        return true;
    } else {
        console.log('❌ Seat selection failed:', response.data);
        return false;
    }
}

async function testBookEvent() {
    console.log('💰 Testing Event Booking...');
    
    const response = await makeRequest(`${BASE_URL}/events/${eventId}/book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
            numberOfTickets: 2,
            paymentMethod: "credit_card",
            specialRequests: "Please ensure seats are together",
            selectedSeats: seatIds.map(id => ({ seatId: id }))
        })
    });
    
    if (response.status === 201) {
        console.log('✅ Event booking successful');
        return true;
    } else {
        console.log('❌ Event booking failed:', response.data);
        return false;
    }
}

async function testGetPublishedEvents() {
    console.log('🎫 Testing Get Published Events...');
    
    const response = await makeRequest(`${BASE_URL}/events`);
    
    if (response.status === 200) {
        console.log(`✅ Retrieved ${response.data.events?.length || 0} published events`);
        return true;
    } else {
        console.log('❌ Get published events failed:', response.data);
        return false;
    }
}

async function testUserProfile() {
    console.log('👤 Testing Get User Profile...');
    
    const response = await makeRequest(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.status === 200) {
        console.log('✅ User profile retrieved successfully');
        return true;
    } else {
        console.log('❌ Get user profile failed:', response.data);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🧪 Starting EMS API Tests');
    console.log('==========================');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Test started at: ${new Date().toISOString()}\n`);
    
    const results = [];
    
    try {
        // Authentication tests
        results.push(await testUserSignup());
        results.push(await testAdminSignup());
        results.push(await testUserLogin());
        results.push(await testAdminLogin());
        
        // Event management tests
        results.push(await testCreateEvent());
        results.push(await testGenerateSeats());
        results.push(await testGetEventSeats());
        
        // Seat selection and booking tests
        results.push(await testSelectSeats());
        results.push(await testBookEvent());
        
        // General API tests
        results.push(await testGetPublishedEvents());
        results.push(await testUserProfile());
        
        // Print results
        console.log('\n📊 Test Results Summary');
        console.log('=======================');
        
        const passedTests = results.filter(Boolean).length;
        const totalTests = results.length;
        
        results.forEach((result, index) => {
            const testNames = [
                'User Signup', 'Admin Signup', 'User Login', 'Admin Login',
                'Event Creation', 'Seat Generation', 'Get Event Seats',
                'Seat Selection', 'Event Booking', 'Get Published Events', 'User Profile'
            ];
            console.log(`${result ? '✅' : '❌'} ${testNames[index]}`);
        });
        
        console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! EMS API is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check the errors above.');
        }
        
    } catch (error) {
        console.error('💥 Test suite failed with error:', error.message);
    }
    
    console.log(`\nTest completed at: ${new Date().toISOString()}`);
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runAllTests();
}

export {
    runAllTests,
    testUserSignup,
    testAdminSignup,
    testUserLogin,
    testAdminLogin,
    testCreateEvent,
    testGenerateSeats,
    testGetEventSeats,
    testSelectSeats,
    testBookEvent
};
