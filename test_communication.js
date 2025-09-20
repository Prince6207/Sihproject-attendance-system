// Test script to verify Express -> FastAPI communication
const axios = require('axios');

async function testCommunication() {
  console.log('🧪 Testing Express -> FastAPI Communication...\n');

  try {
    // Test 1: Check if Express backend is running
    console.log('1. Testing Express Backend...');
    const expressResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Express Backend is running:', expressResponse.data);
  } catch (error) {
    console.log('❌ Express Backend is not running:', error.message);
    return;
  }

  try {
    // Test 2: Check if FastAPI backend is running
    console.log('\n2. Testing FastAPI Backend...');
    const fastApiResponse = await axios.get('http://localhost:8001/');
    console.log('✅ FastAPI Backend is running:', fastApiResponse.data);
  } catch (error) {
    console.log('❌ FastAPI Backend is not running:', error.message);
    return;
  }

  try {
    // Test 3: Test Express -> FastAPI communication
    console.log('\n3. Testing Express -> FastAPI communication...');
    const faceResponse = await axios.post('http://localhost:5000/api/face/login/trace');
    console.log('✅ Face authentication endpoint working:', faceResponse.data);
  } catch (error) {
    console.log('❌ Face authentication failed:', error.response?.data || error.message);
  }

  try {
    // Test 4: Test QR generation
    console.log('\n4. Testing QR generation...');
    const qrResponse = await axios.get('http://localhost:5000/api/qr/generate?sessionId=123');
    console.log('✅ QR generation working:', qrResponse.data ? 'QR data generated' : 'No QR data');
  } catch (error) {
    console.log('❌ QR generation failed:', error.response?.data || error.message);
  }

  console.log('\n🎉 Communication test completed!');
}

testCommunication();
