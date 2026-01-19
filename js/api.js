/**
 * API Service Module
 * Handles all communication with the backend API
 * Base URL: https://workbackend-egr6.onrender.com
 */

const API_BASE_URL = 'https://workbackend-egr6.onrender.com';

const apiService = {
  // --- Token helpers ---
  getToken() {
    return localStorage.getItem('auth_token');
  },
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },
  removeToken() {
    localStorage.removeItem('auth_token');
  },
  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  },
  removeCurrentUser() {
    localStorage.removeItem('current_user');
  },

  /**
   * Main request handler
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          this.removeCurrentUser();
          if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
            window.location.href = '/pages/login.html';
          }
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  /**
   * Authentication APIs
   */
  auth: {
    async register(userData) {
      const response = await apiService.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (response.token) {
        apiService.setToken(response.token);
        if (response.user) apiService.setCurrentUser(response.user);
      }
      return response;
    },

    async login(credentials) {
      const response = await apiService.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (response.token) {
        apiService.setToken(response.token);
        if (response.user) apiService.setCurrentUser(response.user);
      }
      return response;
    },

    async getProfile() {
      const response = await apiService.request('/api/auth/me', {
        method: 'GET',
      });
      if (response.user || response) {
        const user = response.user || response;
        apiService.setCurrentUser(user);
      }
      return response;
    },

    logout() {
      apiService.removeToken();
      apiService.removeCurrentUser();
      window.location.href = '/pages/login.html';
    },
  },

  /**
   * User APIs
   */
  users: {
    async getById(userId) {
      return await apiService.request(`/api/users/${userId}`, {
        method: 'GET',
      });
    },
    // ...other user APIs if needed, add /api/ as needed!
  },

  // (Add other API groups here – tasks, etc. – with /api/ prefix!)
};
