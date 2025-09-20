import React, { useState } from 'react';
import axios from 'axios';
// import './StudentForm.css'; // You can create this file for styling
import './signup.css';
const TeacherForm = () => {
  // Use a single state object to manage all form fields
  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    tclass: '',
  });
  // Handle changes to any input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

    const addteacher=async (teacher)=>{
        const res=await axios.post('http://localhost:5000/api/teacher/register',teacher);
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
      teacherId: '',
      tclass: '',
    });
  };

  return (
    <div className="form-container">
      <h2>Teacher Registration Form</h2>
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
          <label htmlFor="teacherId">Teacher ID:</label>
          <input
            type="number"
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tclass">Class:</label>
          <input
            type="text"
            id="tclass"
            name="tclass"
            value={formData.tclass}
            onChange={handleChange}
            required
          />
        </div>

        
        <button type="submit" className="submit-btn">Register Teacher</button>
      </form>
    </div>
  );
};

export default TeacherForm;