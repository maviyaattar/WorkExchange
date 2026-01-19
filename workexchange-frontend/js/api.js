/**
 * API Service Module
 * Handles all communication with the backend API
 * Base URL: https://workbackend-egr6.onrender.com
 */

const API_BASE_URL = 'https://workbackend-egr6.onrender.com';

/**
 * API Service - Centralized API communication
 */
const apiService = {
  /**
   * Get authentication token from localStorage
   */
  getToken() {
    return localStorage.getItem('auth_token');
  },

  /**
   * Set authentication token in localStorage
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove authentication token from localStorage
   */
  removeToken() {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get current user info from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Set current user info in localStorage
   */
  setCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  },

  /**
   * Remove current user info from localStorage
   */
  removeCurrentUser() {
    localStorage.removeItem('current_user');
  },

  /**
   * Make an HTTP request to the API
   * @param {string} endpoint - API endpoint (e.g., '/auth/login')
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      // Handle error responses
      if (!response.ok) {
        // If unauthorized, clear token and redirect to login
        if (response.status === 401) {
          this.removeToken();
          this.removeCurrentUser();
          if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
            window.location.href = '/workexchange-frontend/pages/login.html';
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
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Registration response
     */
    async register(userData) {
      const response = await apiService.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.token) {
        apiService.setToken(response.token);
        if (response.user) {
          apiService.setCurrentUser(response.user);
        }
      }
      
      return response;
    },

    /**
     * Login user
     * @param {object} credentials - User credentials
     * @returns {Promise<object>} Login response
     */
    async login(credentials) {
      const response = await apiService.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        apiService.setToken(response.token);
        if (response.user) {
          apiService.setCurrentUser(response.user);
        }
      }
      
      return response;
    },

    /**
     * Get current user profile
     * @returns {Promise<object>} User profile
     */
    async getProfile() {
      const response = await apiService.request('/auth/profile', {
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
     */
    logout() {
      apiService.removeToken();
      apiService.removeCurrentUser();
      window.location.href = '/workexchange-frontend/pages/login.html';
    },
  },

  /**
   * User APIs
   */
  users: {
    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<object>} User data
     */
    async getById(userId) {
      return await apiService.request(`/users/${userId}`, {
        method: 'GET',
      });
    },

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {object} userData - Updated user data
     * @returns {Promise<object>} Updated user data
     */
    async update(userId, userData) {
      const response = await apiService.request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      // Update current user if updating own profile
      const currentUser = apiService.getCurrentUser();
      if (currentUser && currentUser._id === userId) {
        apiService.setCurrentUser(response.user || response);
      }
      
      return response;
    },

    /**
     * Get user's received reviews
     * @param {string} userId - User ID
     * @returns {Promise<array>} List of reviews
     */
    async getReviews(userId) {
      return await apiService.request(`/users/${userId}/reviews`, {
        method: 'GET',
      });
    },
  },

  /**
   * Task APIs
   */
  tasks: {
    /**
     * Get all tasks
     * @param {object} params - Query parameters (status, search, etc.)
     * @returns {Promise<array>} List of tasks
     */
    async getAll(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
      return await apiService.request(endpoint, {
        method: 'GET',
      });
    },

    /**
     * Get task by ID
     * @param {string} taskId - Task ID
     * @returns {Promise<object>} Task data
     */
    async getById(taskId) {
      return await apiService.request(`/tasks/${taskId}`, {
        method: 'GET',
      });
    },

    /**
     * Create a new task
     * @param {object} taskData - Task data
     * @returns {Promise<object>} Created task
     */
    async create(taskData) {
      return await apiService.request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    },

    /**
     * Update task
     * @param {string} taskId - Task ID
     * @param {object} taskData - Updated task data
     * @returns {Promise<object>} Updated task
     */
    async update(taskId, taskData) {
      return await apiService.request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    },

    /**
     * Delete task
     * @param {string} taskId - Task ID
     * @returns {Promise<object>} Deletion response
     */
    async delete(taskId) {
      return await apiService.request(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
    },

    /**
     * Assign task to current user
     * @param {string} taskId - Task ID
     * @returns {Promise<object>} Assignment response
     */
    async assign(taskId) {
      return await apiService.request(`/tasks/${taskId}/assign`, {
        method: 'POST',
      });
    },

    /**
     * Submit task completion
     * @param {string} taskId - Task ID
     * @param {object} submissionData - Submission data
     * @returns {Promise<object>} Submission response
     */
    async submit(taskId, submissionData) {
      return await apiService.request(`/tasks/${taskId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
    },

    /**
     * Approve task completion
     * @param {string} taskId - Task ID
     * @param {object} approvalData - Approval data (rating, review)
     * @returns {Promise<object>} Approval response
     */
    async approve(taskId, approvalData) {
      return await apiService.request(`/tasks/${taskId}/approve`, {
        method: 'POST',
        body: JSON.stringify(approvalData),
      });
    },

    /**
     * Get tasks posted by current user
     * @returns {Promise<array>} List of posted tasks
     */
    async getPosted() {
      return await apiService.request('/tasks/posted', {
        method: 'GET',
      });
    },

    /**
     * Get tasks assigned to current user
     * @returns {Promise<array>} List of assigned tasks
     */
    async getAssigned() {
      return await apiService.request('/tasks/assigned', {
        method: 'GET',
      });
    },
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiService;
}
