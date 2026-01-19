 // ===============================
// API CONFIG
// ===============================
const API_BASE = "https://workbackend-egr6.onrender.com";

// ===============================
// TOKEN HELPERS
// ===============================
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

// ===============================
// CORE REQUEST HANDLER
// ===============================
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // 🔥 FIX: Backend expects RAW token (no Bearer)
  if (token) {
    headers["Authorization"] = token;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();

  // Auto logout on auth fail
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      window.location.href = "/pages/login.html";
    }
    throw new Error(data.msg || "API Error");
  }

  return data;
}

// ===============================
// AUTH APIs
// ===============================

// Register
export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// Login
export async function loginUser(payload) {
  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (res.token) {
    setToken(res.token);
  }

  return res;
}

// Logged-in user
export function getMe() {
  return request("/api/auth/me");
}

// Logout
export function logout() {
  clearToken();
  window.location.href = "/pages/login.html";
}

// ===============================
// PROFILE APIs
// ===============================

// Update profile
export function updateProfile(payload) {
  return request("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

// Public profile
export function getUserProfile(userId) {
  return request(`/api/users/${userId}`);
}

// ===============================
// TASK APIs
// ===============================

// Create task
export function createTask(payload) {
  return request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// All open tasks
export function getAllTasks() {
  return request("/api/tasks");
}

// My posted tasks ✅ FIXED ROUTE
export function getMyPostedTasks() {
  return request("/api/tasks/my/posted");
}

// My assigned tasks ✅ FIXED ROUTE
export function getMyAssignedTasks() {
  return request("/api/tasks/my/assigned");
}


    const apiService = {
  registerUser,
  loginUser,
  getMe,
  logout,
  updateProfile,
  getUserProfile,
  createTask,
  getAllTasks,
  getMyPostedTasks,
  getMyAssignedTasks,
  assignTask,
  submitTask,
  approveTask,
  giveReview,
  getUserReviews
};

export default apiService;
// Assign task
export function assignTask(taskId) {
  return request(`/api/tasks/assign/${taskId}`, {
    method: "PUT"
  });
}

// Submit task
export function submitTask(taskId) {
  return request(`/api/tasks/submit/${taskId}`, {
    method: "PUT"
  });
}

// Approve task
export function approveTask(taskId) {
  return request(`/api/tasks/approve/${taskId}`, {
    method: "PUT"
  });
}

// ===============================
// REVIEW APIs
// ===============================

// Give review
export function giveReview(payload) {
  return request("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// Get reviews of user
export function getUserReviews(userId) {
  return request(`/api/reviews/user/${userId}`);
}
