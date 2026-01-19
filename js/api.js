// ===============================
// API CONFIG
// ===============================
const API_BASE = "https://workbackend-egr6.onrender.com";

// ===============================
// TOKEN HELPERS
// ===============================
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const clearToken = () => localStorage.removeItem("token");

// ===============================
// CORE REQUEST HANDLER
// ===============================
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Backend expects RAW token (no 'Bearer' prefix)
  if (token) {
    headers["Authorization"] = token;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      window.location.href = "/pages/login.html";
    }
    throw new Error(data.msg || data.message || "API Error");
  }

  return data;
}

// ===============================
// API SERVICE - Organized by domain
// ===============================
const apiService = {
  // Auth APIs
  auth: {
    async register(payload) {
      const res = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.token) {
        setToken(res.token);
      }
      return res;
    },

    async login(payload) {
      const res = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.token) {
        setToken(res.token);
      }
      return res;
    },

    getProfile() {
      return request("/api/auth/me");
    },

    logout() {
      clearToken();
      window.location.href = "/pages/login.html";
    }
  },

  // User APIs
  users: {
    updateProfile(payload) {
      return request("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    },

    getUser(userId) {
      return request(`/api/users/${userId}`);
    }
  },

  // Task APIs
  tasks: {
    create(payload) {
      return request("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    getAll() {
      return request("/api/tasks");
    },

    getPosted() {
      return request("/api/tasks/my/posted");
    },

    getAssigned() {
      return request("/api/tasks/my/assigned");
    },

    assign(taskId) {
      return request(`/api/tasks/assign/${taskId}`, {
        method: "PUT"
      });
    },

    submit(taskId) {
      return request(`/api/tasks/submit/${taskId}`, {
        method: "PUT"
      });
    },

    approve(taskId) {
      return request(`/api/tasks/approve/${taskId}`, {
        method: "PUT"
      });
    }
  },

  // Review APIs
  reviews: {
    give(payload) {
      return request("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    getUserReviews(userId) {
      return request(`/api/reviews/user/${userId}`);
    }
  }
};

export default apiService;
