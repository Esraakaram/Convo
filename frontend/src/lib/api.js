import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// Users API
export const usersApi = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
};

// Chats API
export const chatsApi = {
  getChats: () => api.get("/chats"),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  sendMessage: (chatId, message) =>
    api.post(`/chats/${chatId}/messages`, { content: message }),
  createChat: (userId) => api.post("/chats", { userId }),
};

// Groups API
export const groupsApi = {
  getGroups: () => api.get("/groups"),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  createGroup: (data) => api.post("/groups", data),
  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
};

export default api; 