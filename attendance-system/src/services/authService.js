import api from "./api";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data; // { user, accessToken, refreshToken }
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Logout failed" };
  }
};

// src/services/authService.js
// import api from "./api";

export const signupUser = async ({ fullName, email, username, password, avatarFile, coverImageFile }) => {
  try {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);
    if (coverImageFile) formData.append("coverImage", coverImageFile);

    const response = await api.post("/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Signup failed" };
  }
};
