/**
 * Quick Connectivity Test for EMS Backend
 * This script tests basic server connectivity without requiring full setup
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testServerConnectivity() {
    console.log('🔍 Testing EMS Backend Connectivity...');
    console.log(`Target URL: ${BASE_URL}\n`);
    
    try {
        // Test 1: Basic server response
        console.log('📡 Test 1: Basic Server Response');
        const response = await fetch(`${BASE_URL}/events`);
        
        if (response.ok) {
            console.log('✅ Server is responding!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Headers: ${response.headers.get('content-type')}`);
        } else {
            console.log(`⚠️  Server responded with status: ${response.status}`);
        }
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('   1. Make sure your server is running (npm run dev)');
        console.log('   2. Check if port 3000 is available');
        console.log('   3. Verify your .env file has PORT=3000');
        console.log('   4. Ensure MongoDB is running and accessible');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Create .env file with required variables');
    console.log('   2. Start MongoDB service');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test with: node test-api-endpoints.js');
}

// Run the test
testServerConnectivity();
