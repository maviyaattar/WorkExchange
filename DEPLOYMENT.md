# WorkExchange Frontend - Deployment Guide

## Quick Start

This is a static web application that requires no build process. Simply serve the files with any web server.

## Local Development

### Option 1: Python (Recommended)
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Node.js
```bash
npx http-server -p 8000
```

### Option 3: PHP
```bash
php -S localhost:8000
```

## Production Deployment

### Netlify (Easiest)
1. Sign up at https://netlify.com
2. Drag and drop the project folder
3. Done! Your site is live.

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

### GitHub Pages
1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch and root folder
4. Save

### AWS S3 + CloudFront
1. Create S3 bucket
2. Enable static website hosting
3. Upload contents
4. Create CloudFront distribution
5. Point to S3 bucket

### Cloudflare Pages
1. Connect GitHub repository
2. Set build directory to root
3. No build command needed
4. Deploy

## Environment Configuration

The API base URL is configured in `js/api.js`:

```javascript
const API_BASE_URL = 'https://workbackend-egr6.onrender.com';
```

To change it, edit this constant before deployment.

## Browser Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance Optimization

The app is already optimized:
- Minimal bundle size (~248KB)
- No framework overhead
- CSS custom properties
- Efficient DOM manipulation
- Lazy loading patterns

## Security Considerations

✅ HTML sanitization on all user input
✅ JWT token in localStorage (consider httpOnly cookies for production)
✅ HTTPS enforced for API calls
✅ No inline scripts (CSP-friendly)
✅ Input validation client-side

## Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring

## Support

For issues, refer to README.md or contact the development team.
