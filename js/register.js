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
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Utility functions
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const result = {
    isValid: true,
    errors: [],
  };

  if (!password || password.length < 6) {
    result.isValid = false;
    result.errors.push('Password must be at least 6 characters long');
  }

  return result;
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
nameInput.addEventListener('input', () => {
  nameInput.classList.remove('error');
  nameError.textContent = '';
});

emailInput.addEventListener('input', () => {
  emailInput.classList.remove('error');
  emailError.textContent = '';
});

passwordInput.addEventListener('input', () => {
  passwordInput.classList.remove('error');
  passwordError.textContent = '';
});

// Handle registration form submission
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  nameInput.classList.remove('error');
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');
  nameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';

  // Get form values
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validate
  let hasError = false;

  if (!name) {
    nameInput.classList.add('error');
    nameError.textContent = 'Name is required';
    hasError = true;
  } else if (name.length < 2) {
    nameInput.classList.add('error');
    nameError.textContent = 'Name must be at least 2 characters';
    hasError = true;
  }

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
  } else {
    const validation = validatePassword(password);
    if (!validation.isValid) {
      passwordInput.classList.add('error');
      passwordError.textContent = validation.errors[0];
      hasError = true;
    }
  }

  if (hasError) return;

  // Submit registration request
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  showLoading(submitBtn);

  try {
    await apiService.auth.register({
      name,
      email,
      password,
    });

    showToast('Registration successful! Redirecting...', 'success');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } catch (error) {
    console.error('Registration failed:', error);
    showToast(error.message || 'Registration failed. Please try again.', 'error');
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
