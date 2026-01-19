/**
 * API Service Module
 * Handles all communication with the backend API
 * Base URL: https://workbackend-egr6.onrender.com
 * 
 * Authentication Flow:
 * 1. User submits login credentials via login page
 * 2. Backend validates credentials and returns JWT token
 * 3. Token is stored in localStorage via setToken()
 * 4. All subsequent API requests include token in Authorization header
 * 5. If token is invalid/expired (401 response), user is redirected to login
 * 6. On logout, token is removed and user redirected to login page
 */

const API_BASE_URL = 'https://workbackend-egr6.onrender.com';

const apiService = {
  /**
   * JWT Token Management
   * Tokens are stored in localStorage and sent in Authorization header
   */
  getToken() {
    return localStorage.getItem('auth_token');
  },
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },
  removeToken() {
    localStorage.removeItem('auth_token');
  },
  /**
   * User Data Management
   * Stores user profile data in localStorage for quick access
   */
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
   * Automatically includes JWT token in Authorization header for protected routes
   * Handles 401 unauthorized responses by redirecting to login page
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Include JWT token in Authorization header if available
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
        // Handle unauthorized - clear auth and redirect to login
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
   * Handles user registration, login, profile retrieval, and logout
   */
  auth: {
    /**
     * Register new user
     * Stores JWT token and user data on successful registration
     */
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

    /**
     * Login user with email and password
     * Stores JWT token and user data on successful login
     */
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

    /**
     * Get current user profile
     * Requires valid JWT token in Authorization header
     */
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

    /**
     * Logout user
     * Clears JWT token and user data, redirects to login page
     */
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
  },

  /**
   * Task APIs
   * All task operations require authentication (JWT token in Authorization header)
   */
  tasks: {
    /**
     * Get all tasks with optional filters
     */
    async getAll(filters = {}) {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/api/tasks?${queryParams}` : '/api/tasks';
      return await apiService.request(endpoint, {
        method: 'GET',
      });
    },

    /**
     * Get tasks posted by current user
     */
    async getPosted() {
      return await apiService.request('/api/tasks/posted', {
        method: 'GET',
      });
    },

    /**
     * Get tasks assigned to current user
     */
    async getAssigned() {
      return await apiService.request('/api/tasks/assigned', {
        method: 'GET',
      });
    },

    /**
     * Create a new task
     */
    async create(taskData) {
      return await apiService.request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    },

    /**
     * Assign task to current user
     */
    async assign(taskId) {
      return await apiService.request(`/api/tasks/${taskId}/assign`, {
        method: 'POST',
      });
    },

    /**
     * Submit completed task
     */
    async submit(taskId, data) {
      return await apiService.request(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Approve completed task
     */
    async approve(taskId, data) {
      return await apiService.request(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
