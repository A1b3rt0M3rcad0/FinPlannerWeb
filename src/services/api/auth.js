import api from "../../config/api";

const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Login Admin
  loginAdmin: async (email, password) => {
    const response = await api.post("/auth/admin/login", { email, password });
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put("/users/me", {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    });
    return response.data;
  },

  // Logout (limpar token local)
  logout: () => {
    localStorage.removeItem("finplanner_access_token");
    localStorage.removeItem("finplanner_refresh_token");
    localStorage.removeItem("finplanner_user_info");
  },
};

export default authAPI;
