// src/components/Signup.jsx
import React, { useState } from "react";
import { signupUser } from "../services/authService";

const Signup = ({ onSignup }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await signupUser({
        fullName,
        email,
        username,
        password,
        avatarFile: avatar,
        coverImageFile: coverImage,
      });
      onSignup(data.user); // set user state after signup
      setError("");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Avatar:</label>
        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} required />
        <label>Cover Image (optional):</label>
        <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Signup;
