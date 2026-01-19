/**
 * UI Components Module
 * Reusable UI components (Toast, Modal, Skeleton loaders, etc.)
 */

const uiComponents = {
  /**
   * Toast notification system
   */
  toast: {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 = no auto-hide)
     */
    show(message, type = 'info', duration = 4000) {
      this.init();

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const iconMap = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      };

      toast.innerHTML = `
        <div class="toast-icon">${iconMap[type]}</div>
        <div class="toast-content">
          <div class="toast-message">${utils.sanitizeHTML(message)}</div>
        </div>
        <button class="toast-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      // Close button handler
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        this.hide(toast);
      });

      this.container.appendChild(toast);

      // Auto-hide after duration
      if (duration > 0) {
        setTimeout(() => {
          this.hide(toast);
        }, duration);
      }

      return toast;
    },

    /**
     * Hide toast notification
     * @param {HTMLElement} toast - Toast element to hide
     */
    hide(toast) {
      toast.style.animation = 'slideOut 0.2s ease-in-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    },

    /**
     * Convenience methods
     */
    success(message, duration) {
      return this.show(message, 'success', duration);
    },

    error(message, duration) {
      return this.show(message, 'error', duration);
    },

    warning(message, duration) {
      return this.show(message, 'warning', duration);
    },

    info(message, duration) {
      return this.show(message, 'info', duration);
    },
  },

  /**
   * Modal system
   */
  modal: {
    /**
     * Show modal
     * @param {object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    show(options = {}) {
      const {
        title = '',
        content = '',
        footer = '',
        onClose = null,
        closeOnBackdrop = true,
      } = options;

      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';

      modal.innerHTML = `
        <div class="modal-header">
          <h3 class="modal-title">${utils.sanitizeHTML(title)}</h3>
          <button class="modal-close" aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      `;

      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Close handlers
      const closeModal = () => {
        document.body.style.overflow = '';
        backdrop.style.animation = 'fadeOut 0.2s ease-in-out';
        setTimeout(() => {
          if (backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
          }
          if (onClose) onClose();
        }, 200);
      };

      // Close button
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', closeModal);

      // Close on backdrop click
      if (closeOnBackdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            closeModal();
          }
        });
      }

      // Close on escape key
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      return { backdrop, modal, close: closeModal };
    },

    /**
     * Show confirmation modal
     * @param {object} options - Confirmation options
     * @returns {Promise<boolean>} User's choice
     */
    confirm(options = {}) {
      const {
        title = 'Confirm Action',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        confirmClass = 'btn-primary',
      } = options;

      return new Promise((resolve) => {
        const footer = `
          <button class="btn btn-secondary" data-action="cancel">${utils.sanitizeHTML(cancelText)}</button>
          <button class="btn ${confirmClass}" data-action="confirm">${utils.sanitizeHTML(confirmText)}</button>
        `;

        const { backdrop, modal, close } = this.show({
          title,
          content: `<p>${utils.sanitizeHTML(message)}</p>`,
          footer,
          closeOnBackdrop: false,
        });

        // Handle button clicks
        modal.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          if (action === 'confirm') {
            resolve(true);
            close();
          } else if (action === 'cancel') {
            resolve(false);
            close();
          }
        });
      });
    },
  },

  /**
   * Skeleton loader components
   */
  skeleton: {
    /**
     * Create skeleton card
     * @returns {string} HTML string
     */
    card() {
      return `
        <div class="card">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
        </div>
      `;
    },

    /**
     * Create skeleton task card
     * @returns {string} HTML string
     */
    taskCard() {
      return `
        <div class="task-card">
          <div class="task-header">
            <div class="flex-1">
              <div class="skeleton skeleton-title"></div>
            </div>
            <div class="skeleton" style="width: 60px; height: 24px;"></div>
          </div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
          <div class="task-meta">
            <div class="skeleton" style="width: 80px; height: 16px;"></div>
            <div class="skeleton" style="width: 60px; height: 16px;"></div>
          </div>
        </div>
      `;
    },

    /**
     * Create skeleton stat card
     * @returns {string} HTML string
     */
    statCard() {
      return `
        <div class="stat-card">
          <div class="skeleton skeleton-text" style="width: 100px; height: 14px;"></div>
          <div class="skeleton" style="width: 80px; height: 40px; margin-top: 8px;"></div>
        </div>
      `;
    },

    /**
     * Create skeleton user profile
     * @returns {string} HTML string
     */
    userProfile() {
      return `
        <div class="user-profile-card">
          <div class="skeleton skeleton-avatar mx-auto"></div>
          <div class="skeleton skeleton-title mx-auto" style="width: 150px;"></div>
          <div class="skeleton skeleton-text mx-auto" style="width: 200px;"></div>
        </div>
      `;
    },

    /**
     * Create skeleton review card
     * @returns {string} HTML string
     */
    reviewCard() {
      return `
        <div class="review-card">
          <div class="review-header">
            <div class="skeleton skeleton-avatar"></div>
            <div class="flex-1">
              <div class="skeleton skeleton-text" style="width: 120px;"></div>
              <div class="skeleton skeleton-text" style="width: 80px;"></div>
            </div>
          </div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
        </div>
      `;
    },

    /**
     * Show multiple skeleton items
     * @param {string} type - Skeleton type
     * @param {number} count - Number of skeletons
     * @returns {string} HTML string
     */
    multiple(type, count = 3) {
      let html = '';
      for (let i = 0; i < count; i++) {
        html += this[type]();
      }
      return html;
    },
  },

  /**
   * Empty state component
   */
  emptyState: {
    /**
     * Create empty state
     * @param {object} options - Empty state options
     * @returns {string} HTML string
     */
    create(options = {}) {
      const {
        icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        title = 'No items found',
        description = 'There are no items to display.',
        action = null,
      } = options;

      return `
        <div class="empty-state">
          <div class="empty-state-icon">${icon}</div>
          <h3 class="empty-state-title">${utils.sanitizeHTML(title)}</h3>
          <p class="empty-state-description">${utils.sanitizeHTML(description)}</p>
          ${action ? action : ''}
        </div>
      `;
    },
  },

  /**
   * Loading overlay
   */
  loading: {
    overlay: null,

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    show(message = 'Loading...') {
      if (this.overlay) {
        this.hide();
      }

      this.overlay = document.createElement('div');
      this.overlay.className = 'modal-backdrop';
      this.overlay.style.zIndex = 9999;
      this.overlay.innerHTML = `
        <div style="text-align: center; color: white;">
          <div class="btn btn-primary btn-loading" style="pointer-events: none; margin-bottom: 1rem;"></div>
          <p>${utils.sanitizeHTML(message)}</p>
        </div>
      `;
      document.body.appendChild(this.overlay);
      document.body.style.overflow = 'hidden';
    },

    /**
     * Hide loading overlay
     */
    hide() {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null;
        document.body.style.overflow = '';
      }
    },
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = uiComponents;
}
