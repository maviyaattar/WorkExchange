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
// GLOBAL AUTH GUARD
// ===============================
/**
 * Checks authentication status on page load.
 * Redirects to login if no token is present.
 * Should be called on all protected pages.
 * Public pages (login, register) should skip this check.
 */
function requireAuth() {
  const token = getToken();
  const currentPath = window.location.pathname;
  
  // List of public pages that don't require authentication
  const publicPages = ['/login.html', '/register.html', '/index.html', '/'];
  const isPublicPage = publicPages.some(page => currentPath.endsWith(page));
  
  if (!token && !isPublicPage) {
    // No token found, redirect to login
    window.location.href = '/pages/login.html';
    return false;
  }
  
  return true;
}

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

// ===============================
// EXPORTS
// ===============================
// Export as default for module imports
export default apiService;

// Also expose globally for non-module scripts
if (typeof window !== 'undefined') {
  window.apiService = apiService;
  window.requireAuth = requireAuth;
  window.clearToken = clearToken;
}
