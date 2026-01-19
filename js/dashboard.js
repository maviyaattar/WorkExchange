import apiService from './api.js';

// Check authentication - redirect to login if not authenticated
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Utility functions
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 16px 24px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; animation: slideIn 0.3s ease;';
  
  const color = type === 'success' ? '#10b981' : '#ef4444';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 20px; height: 20px; border-radius: 50%; background: ${color};"></div>
      <span style="color: #111827; font-weight: 500;">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getStatusBadgeClass(status) {
  const statusMap = {
    open: 'badge-info',
    assigned: 'badge-warning',
    submitted: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-error',
    pending: 'badge-warning',
  };
  
  return statusMap[status?.toLowerCase()] || 'badge-gray';
}

function getStatusDisplayText(status) {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Load dashboard data
async function loadDashboard() {
  try {
    // Load user profile
    const profileResponse = await apiService.auth.getProfile();
    const user = profileResponse.user || profileResponse;

    // Update coin balance card
    const coinBalanceCard = document.getElementById('coinBalanceCard');
    coinBalanceCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-secondary mb-2">Your Balance</div>
          <div class="text-3xl font-bold flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32" class="text-warning">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span class="text-primary">${formatNumber(user.coins || 0)} Coins</span>
          </div>
        </div>
        <div class="flex gap-2">
          <a href="browse-tasks.html" class="btn btn-sm btn-outline">Earn More</a>
        </div>
      </div>
    `;

    // Load task statistics
    const [postedTasks, assignedTasks] = await Promise.all([
      apiService.tasks.getPosted(),
      apiService.tasks.getAssigned()
    ]);

    const posted = postedTasks.tasks || postedTasks || [];
    const assigned = assignedTasks.tasks || assignedTasks || [];
    const completedTasks = assigned.filter(t => t.status === 'completed');

    // Update stats grid
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Posted Tasks</div>
        <div class="stat-value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" class="stat-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          ${posted.length}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Assigned Tasks</div>
        <div class="stat-value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" class="stat-icon">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          ${assigned.length}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Completed</div>
        <div class="stat-value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" class="stat-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          ${completedTasks.length}
        </div>
      </div>
    `;

    // Update sidebar user info
    const sidebarUserInfo = document.getElementById('sidebarUserInfo');
    if (sidebarUserInfo) {
      sidebarUserInfo.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="user-avatar" style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; border-radius: var(--radius-full); color: white; font-weight: 600; font-size: 14px;">
            ${getInitials(user.name)}
          </div>
          <div class="flex-1" style="min-width: 0;">
            <div class="font-medium text-sm" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sanitizeHTML(user.name)}</div>
            <div class="text-xs text-secondary">${formatNumber(user.coins || 0)} coins</div>
          </div>
        </div>
      `;
    }

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showToast(error.message || 'Failed to load dashboard data', 'error');
  }
}

// Initialize
loadDashboard();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
