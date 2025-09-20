// Test script to verify the student registration endpoint
import fetch from 'node-fetch';

const testStudentRegistration = async () => {
  const testData = {
    name: "John Doe",
    rollNumber: "2024001",
    sclass: "10",
    section: "A",
    studentMail: "john.doe@example.com"
  };

  try {
    console.log("Testing student registration endpoint...");
    console.log("Sending data:", testData);
    
    const response = await fetch('http://localhost:5000/api/student/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", result);
  } catch (error) {
    console.error("Error testing endpoint:", error);
  }
};

testStudentRegistration();
