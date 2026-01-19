# Authentication System Documentation

## Overview

The WorkExchange application now uses a **centralized, global authentication system** that ensures consistent token handling and validation across all pages. This document explains how the authentication system works and how to use it.

## Architecture

### Components

1. **auth-guard.js** - Global authentication guard
2. **api.js** - Centralized API service with token management
3. **utils.js** - Utility functions (auth methods now deprecated)

### Token Management

- **Token Key**: `'token'` (stored in localStorage)
- **Token Storage**: `localStorage.setItem('token', tokenValue)`
- **Token Retrieval**: `localStorage.getItem('token')`
- **Token Clearing**: `localStorage.removeItem('token')`

## How It Works

### 1. Page Load Authentication (auth-guard.js)

Every protected page loads `auth-guard.js` as the **first script** (before any other scripts or modules). This script:

- Checks for the presence of a `token` in localStorage
- If no token is found and the page is protected, it:
  - Immediately redirects to `/pages/login.html`
  - Throws an error to stop script execution
  - Prevents page content from loading
- If a token exists, allows the page to continue loading

**Example usage in HTML:**
```html
<body>
  <!-- Other page content -->
  
  <!-- Global authentication guard - must load FIRST -->
  <script src="../js/auth-guard.js"></script>
  <script type="module" src="../js/dashboard.js"></script>
</body>
```

### 2. API Call Authentication (api.js)

All API calls go through the centralized `apiService` which:

- Automatically attaches the token to request headers
- Handles 401 Unauthorized responses globally:
  - Clears the token from localStorage
  - Redirects to `/pages/login.html`
  - Throws an error with the API message

**Example API call:**
```javascript
try {
  const response = await apiService.auth.getProfile();
  // Handle success
} catch (error) {
  // 401 errors are handled automatically
  // Other errors need manual handling
  console.error('API error:', error.message);
}
```

### 3. Login/Register Flow

When users successfully log in or register:

1. The API returns a JWT token
2. `api.js` automatically stores it: `localStorage.setItem('token', token)`
3. User is redirected to the dashboard
4. All subsequent page loads have the token available

**Example login:**
```javascript
try {
  await apiService.auth.login({ email, password });
  // Token is automatically stored
  window.location.href = 'dashboard.html';
} catch (error) {
  // Handle login error
  showToast(error.message, 'error');
}
```

### 4. Logout Flow

To log out a user:

```javascript
apiService.auth.logout();
// This will:
// 1. Clear the token from localStorage
// 2. Redirect to /pages/login.html
```

## Protected vs Public Pages

### Protected Pages (require authentication)
- dashboard.html
- create-task.html
- browse-tasks.html
- my-tasks.html
- post-task.html
- profile.html
- settings.html
- user-profile.html

All protected pages **must** include `auth-guard.js` as the first script.

### Public Pages (no authentication required)
- login.html
- register.html
- index.html (landing page)

Public pages should **NOT** include `auth-guard.js`.

## Adding a New Protected Page

To create a new protected page:

1. Create your HTML file in `/pages/`
2. Add the auth guard as the **first script**:
```html
<body>
  <!-- Your page content here -->
  
  <!-- Global authentication guard - must load FIRST -->
  <script src="../js/auth-guard.js"></script>
  
  <!-- Your other scripts -->
  <script src="../js/utils.js"></script>
  <script src="../js/components.js"></script>
  <script type="module" src="../js/api.js"></script>
  <script>
    // Your page logic that uses apiService
  </script>
</body>
```

## Security Features

### 1. Immediate Redirect
- Users without tokens are redirected **before** any page content loads
- Prevents unauthorized users from seeing protected content even briefly

### 2. Token Expiration Handling
- Invalid or expired tokens cause 401 responses from the API
- 401 responses automatically clear the token and redirect to login
- Works consistently across all pages and API calls

### 3. Single Source of Truth
- Only one place to check authentication: `auth-guard.js`
- Only one place to handle API errors: `api.js` request handler
- Eliminates inconsistencies and duplicate code

### 4. No Client-Side Token Validation
- We don't validate JWT tokens client-side (complexity, security risk)
- Token validity is checked by the backend on each API call
- Invalid tokens result in 401, triggering automatic logout

## Troubleshooting

### Issue: Page shows "Authentication required" error
**Cause**: No token in localStorage when accessing protected page
**Solution**: User needs to log in. They should be automatically redirected to login page.

### Issue: User stuck in redirect loop
**Cause**: Token exists but is invalid, causing 401 on dashboard load
**Solution**: Clear localStorage manually or ensure backend is returning valid tokens

### Issue: "apiService is not defined" error
**Cause**: Inline script trying to use apiService before module loads
**Solution**: Ensure api.js is loaded as `<script type="module">`

### Issue: User stays logged in after closing browser
**Cause**: localStorage persists across sessions
**Solution**: This is expected behavior. To change, use sessionStorage instead.

## Migration Notes

### Changes from Previous Implementation

**Before:**
- Each page had its own token check: `const token = localStorage.getItem('token')`
- Inconsistent token keys: some used `'token'`, others used `'auth_token'`
- utils.requireAuth() was called manually in inline scripts
- Dashboard and create-task had duplicate auth logic

**After:**
- Single auth-guard.js checks token for all pages
- Consistent token key: `'token'` everywhere
- No manual requireAuth() calls needed
- No duplicate auth logic in page scripts

### Deprecated Methods

- ~~`utils.requireAuth()`~~ - Use auth-guard.js instead
- Token key `'auth_token'` - Use `'token'` instead

## Best Practices

1. **Always load auth-guard.js first** on protected pages
2. **Use apiService** for all API calls (don't create custom fetch calls)
3. **Don't manually check tokens** in page scripts (auth-guard handles it)
4. **Don't store tokens** manually (api.js handles it on login/register)
5. **Use apiService.auth.logout()** to log out (don't just clear localStorage)

## Testing Authentication

To test the authentication system:

1. **Test protected page access without token:**
   - Clear localStorage in browser DevTools
   - Try to access any protected page (e.g., `/pages/dashboard.html`)
   - Should redirect to `/pages/login.html` immediately

2. **Test with valid token:**
   - Log in successfully
   - Navigate to any protected page
   - Should load normally

3. **Test with expired/invalid token:**
   - Set an invalid token: `localStorage.setItem('token', 'invalid')`
   - Try to access a protected page
   - Page loads but first API call should return 401
   - Should automatically redirect to login

4. **Test logout:**
   - Click logout button
   - Should redirect to login and clear token
   - Try to go back to protected page
   - Should redirect to login again

## API Reference

### apiService.auth

- `login(credentials)` - Log in user
- `register(userData)` - Register new user  
- `logout()` - Log out current user
- `getProfile()` - Get current user profile

### apiService.tasks

- `create(taskData)` - Create new task
- `getAll()` - Get all tasks
- `getPosted()` - Get user's posted tasks
- `getAssigned()` - Get user's assigned tasks
- `assign(taskId)` - Assign task to self
- `submit(taskId)` - Submit task completion
- `approve(taskId)` - Approve completed task

### apiService.users

- `updateProfile(userData)` - Update user profile
- `getUser(userId)` - Get user by ID

### apiService.reviews

- `give(reviewData)` - Give a review
- `getUserReviews(userId)` - Get user's reviews

## Summary

The new authentication system provides:
- ✅ Centralized token management
- ✅ Consistent behavior across all pages
- ✅ Automatic 401 error handling
- ✅ Immediate protection against unauthorized access
- ✅ Clean, maintainable code
- ✅ Single source of truth for authentication logic
