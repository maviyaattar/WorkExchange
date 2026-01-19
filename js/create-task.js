import apiService from './api.js';

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

function showLoading(btn) {
  btn.disabled = true;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = 'Loading...';
  btn.classList.add('btn-loading');
}

function hideLoading(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.originalText;
  btn.classList.remove('btn-loading');
}

let currentUser = null;

// Load user profile
async function loadUserProfile() {
  try {
    const profileResponse = await apiService.auth.getProfile();
    currentUser = profileResponse.user || profileResponse;

    // Update balance display
    const userCoins = document.getElementById('userCoins');
    userCoins.textContent = `${formatNumber(currentUser.coins || 0)} Coins`;

    // Update sidebar
    const sidebarUserInfo = document.getElementById('sidebarUserInfo');
    if (sidebarUserInfo) {
      sidebarUserInfo.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="user-avatar" style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; border-radius: var(--radius-full); color: white; font-weight: 600; font-size: 14px;">
            ${getInitials(currentUser.name)}
          </div>
          <div class="flex-1" style="min-width: 0;">
            <div class="font-medium text-sm" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sanitizeHTML(currentUser.name)}</div>
            <div class="text-xs text-secondary">${formatNumber(currentUser.coins || 0)} coins</div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
    showToast(error.message || 'Failed to load profile', 'error');
  }
}

// Form elements
const createTaskForm = document.getElementById('createTaskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const coinsInput = document.getElementById('coins');
const titleError = document.getElementById('titleError');
const descriptionError = document.getElementById('descriptionError');
const coinsError = document.getElementById('coinsError');
const charCount = document.getElementById('charCount');

// Character counter
descriptionInput.addEventListener('input', () => {
  charCount.textContent = descriptionInput.value.length;
  descriptionInput.classList.remove('error');
  descriptionError.textContent = '';
});

// Clear errors on input
titleInput.addEventListener('input', () => {
  titleInput.classList.remove('error');
  titleError.textContent = '';
});

coinsInput.addEventListener('input', () => {
  coinsInput.classList.remove('error');
  coinsError.textContent = '';
});

// Form submission
createTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  titleInput.classList.remove('error');
  descriptionInput.classList.remove('error');
  coinsInput.classList.remove('error');
  titleError.textContent = '';
  descriptionError.textContent = '';
  coinsError.textContent = '';

  // Get form values
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const coins = parseInt(coinsInput.value);

  // Validate
  let hasError = false;

  if (!title) {
    titleInput.classList.add('error');
    titleError.textContent = 'Title is required';
    hasError = true;
  } else if (title.length < 5) {
    titleInput.classList.add('error');
    titleError.textContent = 'Title must be at least 5 characters';
    hasError = true;
  }

  if (!description) {
    descriptionInput.classList.add('error');
    descriptionError.textContent = 'Description is required';
    hasError = true;
  } else if (description.length < 10) {
    descriptionInput.classList.add('error');
    descriptionError.textContent = 'Description must be at least 10 characters';
    hasError = true;
  }

  if (!coins || isNaN(coins)) {
    coinsInput.classList.add('error');
    coinsError.textContent = 'Coins amount is required';
    hasError = true;
  } else if (coins < 1) {
    coinsInput.classList.add('error');
    coinsError.textContent = 'Minimum 1 coin required';
    hasError = true;
  } else if (currentUser && coins > currentUser.coins) {
    coinsInput.classList.add('error');
    coinsError.textContent = `Insufficient balance. You have ${formatNumber(currentUser.coins)} coins`;
    hasError = true;
  }

  if (hasError) return;

  // Submit task
  const submitBtn = createTaskForm.querySelector('button[type="submit"]');
  showLoading(submitBtn);

  try {
    await apiService.tasks.create({
      title,
      description,
      coins,
    });

    showToast('Task created successfully!', 'success');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Failed to create task:', error);
    showToast(error.message || 'Failed to create task', 'error');
    hideLoading(submitBtn);
  }
});

// Initialize
loadUserProfile();

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
