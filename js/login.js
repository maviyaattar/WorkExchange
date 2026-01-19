import apiService from './api.js';

// Check if user is already logged in - redirect to dashboard if authenticated
const token = localStorage.getItem('token');
if (token) {
  window.location.href = 'dashboard.html';
}

// Password toggle functionality
const passwordToggle = document.querySelector('.password-toggle');
const passwordInput = document.getElementById('password');
const eyeIcon = passwordToggle.querySelector('.eye-icon');
const eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');

passwordToggle.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  eyeIcon.classList.toggle('hidden');
  eyeOffIcon.classList.toggle('hidden');
});

// Form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Utility functions
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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

// Clear errors on input
emailInput.addEventListener('input', () => {
  emailInput.classList.remove('error');
  emailError.textContent = '';
});

passwordInput.addEventListener('input', () => {
  passwordInput.classList.remove('error');
  passwordError.textContent = '';
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');
  emailError.textContent = '';
  passwordError.textContent = '';

  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Client-side validation
  let hasError = false;

  if (!email) {
    emailInput.classList.add('error');
    emailError.textContent = 'Email is required';
    hasError = true;
  } else if (!isValidEmail(email)) {
    emailInput.classList.add('error');
    emailError.textContent = 'Please enter a valid email';
    hasError = true;
  }

  if (!password) {
    passwordInput.classList.add('error');
    passwordError.textContent = 'Password is required';
    hasError = true;
  }

  if (hasError) return;

  // Show loading state
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  showLoading(submitBtn);

  try {
    // Call login API - this will store the JWT token in localStorage
    await apiService.auth.login({
      email,
      password,
    });

    // Show success message
    showToast('Login successful! Redirecting...', 'success');
    
    // Redirect to dashboard after successful login
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } catch (error) {
    // Display error message for failed login attempts
    console.error('Login failed:', error);
    showToast(error.message || 'Login failed. Please try again.', 'error');
    hideLoading(submitBtn);
  }
});

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
