import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import './StudentForm.css'; // You can create this file for styling
import './signup.css';
const Tlogin = () => {
  // Use a single state object to manage all form fields
  const [formData, setFormData] = useState({
    teacherId: ''
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
        const res=await axios.post('http://localhost:5000/api/teacher/login',teacher);
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
      teacherId: ''
    });
  };
    const navigate = useNavigate();
  return (
    <div className="form-container">
      <h2>Teacher Login Form</h2>
      <form onSubmit={handleSubmit}>
        
       

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

        

        
        <button type="submit" className="submit-btn">Login Teacher</button>
      </form>
        <button className="navigate-btn" onClick={() => navigate('/teacher/signup')}>Don't have any account</button>
    </div>
  );
};

export default Tlogin;