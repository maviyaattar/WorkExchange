/**
 * Global Authentication Guard
 * This script checks for a valid authentication token on page load
 * and redirects to login if not found.
 * 
 * This should be loaded as the FIRST script on all protected pages.
 * Load it as a regular script (not module) so it blocks page rendering
 * until authentication is verified.
 */

(function() {
  'use strict';
  
  // Check for authentication token
  const token = localStorage.getItem('token');
  const currentPath = window.location.pathname;
  
  // List of public pages that don't require authentication
  // NOTE: If you add new public pages, update this list
  const publicPages = ['/login.html', '/register.html', '/index.html', '/'];
  const isPublicPage = publicPages.some(page => currentPath.endsWith(page) || currentPath === page);
  
  // If no token and not on a public page, redirect to login
  if (!token && !isPublicPage) {
    window.location.href = '/pages/login.html';
    // Stop script execution to prevent any page content from loading
    throw new Error('Authentication required');
  }
  
  // Token exists, allow page to continue loading
  console.log('Authentication verified');
})();
