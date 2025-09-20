import React, { useState } from 'react';
import axios from 'axios';
// import './StudentForm.css'; // You can create this file for styling
import './signup.css';
const StudentForm = () => {
  // Use a single state object to manage all form fields
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    sclass: '',
    section: '',
    studentMail: ''
  });
  // Handle changes to any input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

    const addstudent=async (student)=>{
        const res=await axios.post('http://localhost:8000/api/student/register',student);
        console.log(res.data);
    }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    addstudent(formData);
    // For now, we'll just log the data.
    // In a real application, you would send this data to your backend API.
    // console.log('Form data to be submitted:', formData);


    // You can add your API call here, for example:
    /*
    fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    */

    // Optionally, clear the form after submission
    setFormData({
      name: '',
      rollNumber: '',
      sclass: '',
      section: '',
      studentMail: ''
    });
  };

  return (
    <div className="form-container">
      <h2>Student Registration Form</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number:</label>
          <input
            type="number"
            id="rollNumber"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sclass">Class:</label>
          <input
            type="text"
            id="sclass"
            name="sclass"
            value={formData.sclass}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="section">Section:</label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentMail">Student Email:</label>
          <input
            type="email"
            id="studentMail"
            name="studentMail"
            value={formData.studentMail}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Register Student</button>
      </form>
    </div>
  );
};

export default StudentForm;