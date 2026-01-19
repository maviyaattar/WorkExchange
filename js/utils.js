/**
 * Utility Functions Module
 * Reusable helper functions for the application
 */

const utils = {
  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  },

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, length = 100) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  /**
   * Get initials from name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  getInitials(name) {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result
   */
  validatePassword(password) {
    const result = {
      isValid: true,
      errors: [],
    };

    if (!password || password.length < 6) {
      result.isValid = false;
      result.errors.push('Password must be at least 6 characters long');
    }

    return result;
  },

  /**
   * Get status badge class
   * @param {string} status - Status value
   * @returns {string} Badge class name
   */
  getStatusBadgeClass(status) {
    const statusMap = {
      open: 'badge-info',
      assigned: 'badge-warning',
      submitted: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-error',
      pending: 'badge-warning',
    };
    
    return statusMap[status?.toLowerCase()] || 'badge-gray';
  },

  /**
   * Get status display text
   * @param {string} status - Status value
   * @returns {string} Display text
   */
  getStatusDisplayText(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  },

  /**
   * Create star rating HTML
   * @param {number} rating - Rating value (0-5)
   * @returns {string} HTML string for stars
   */
  createStarRating(rating = 0) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      html += '<svg class="star-icon filled" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    // Half star
    if (hasHalfStar) {
      html += '<svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      html += '<svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    return html;
  },

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
    }
  },

  /**
   * Get current page name from URL
   * @returns {string} Page name
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page.replace('.html', '') || 'dashboard';
  },

  /**
   * Set active navigation item
   * @param {string} activePage - Active page name
   */
  setActiveNav(activePage) {
    // Bottom navigation
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    bottomNavItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && href.includes(activePage)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-nav .sidebar-item');
    sidebarItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && href.includes(activePage)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  /**
   * Show loading state on element
   * @param {HTMLElement} element - Element to show loading on
   */
  showLoading(element) {
    if (!element) return;
    
    element.disabled = true;
    element.classList.add('btn-loading');
    
    // Store original text
    if (!element.dataset.originalText) {
      element.dataset.originalText = element.textContent;
    }
  },

  /**
   * Hide loading state on element
   * @param {HTMLElement} element - Element to hide loading from
   */
  hideLoading(element) {
    if (!element) return;
    
    element.disabled = false;
    element.classList.remove('btn-loading');
    
    // Restore original text
    if (element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
    }
  },

  /**
   * Scroll to top of page smoothly
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  },

  /**
   * Format coin amount with icon
   * @param {number} amount - Coin amount
   * @returns {string} HTML string
   */
  formatCoins(amount) {
    return `
      <span class="coin-display">
        <svg class="coin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v12M9 12h6"/>
        </svg>
        ${this.formatNumber(amount)}
      </span>
    `;
  },

  /**
   * Parse error message from API response
   * @param {Error} error - Error object
   * @returns {string} Error message
   */
  parseError(error) {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred. Please try again.';
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
}
