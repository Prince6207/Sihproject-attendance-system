import React from "react";
import { logoutUser } from "../services/authService";

const LogoutButton = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      onLogout(); // lift state up
    } catch (err) {
      console.log(err.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;