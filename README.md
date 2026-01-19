# WorkExchange Frontend

A production-ready, mobile-first frontend application for the WorkExchange platform. Built with vanilla HTML, CSS, and JavaScript (no frameworks).

## 🚀 Features

### Authentication
- **Login & Register**: JWT-based authentication with password visibility toggle
- Secure token storage in localStorage
- Automatic session management with redirect on expiry
- Form validation with inline error messages

### Pages

#### Dashboard
- Coin balance display
- Task statistics (posted, assigned, completed)
- Quick action buttons
- Responsive layout with loading skeletons

#### Browse Tasks
- View all available tasks
- Filter by status (open, assigned, completed)
- Expandable task details
- One-click task assignment
- Empty state for no tasks

#### Post Task
- Create new tasks with title, description, and coin reward
- Real-time coin balance validation
- Character counter for description
- Prevents posting if insufficient coins
- Form validation with helpful errors

#### My Tasks
- **Tabbed interface**: "Posted by Me" and "Assigned to Me"
- **Posted Tab**: Review and approve submitted work
- **Assigned Tab**: Submit completed work
- Status badges for all tasks
- Action buttons contextual to task state

#### Profile
- View and edit personal profile
- Update name, bio, and skills
- Display rating and coin balance
- Skills shown as badges

#### Public User Profile
- View other users' profiles
- See ratings and reviews
- Display received reviews with star ratings
- Empty state for users with no reviews

#### Settings
- Update profile information
- Logout functionality
- Account management
- About section

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Secondary**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Scales**: 12px to 36px with consistent line heights
- **Weights**: Light (300) to Bold (700)

### Components
- Cards with hover effects and shadows
- Buttons (primary, secondary, success, error, outline, ghost)
- Form inputs with focus states
- Badges for status display
- Toast notifications
- Modal dialogs
- Skeleton loaders
- Empty states

### Navigation
- **Mobile**: Bottom navigation bar (fixed)
- **Desktop**: Left sidebar (fixed)
- Active state highlighting
- Touch-friendly targets (44px minimum)

## 📁 Project Structure

```
WorkExchange/
├── index.html              # Landing page
├── css/
│   └── styles.css          # Complete design system
├── js/
│   ├── api.js              # API service module
│   ├── utils.js            # Utility functions
│   └── components.js       # UI components (toast, modal, skeleton)
├── pages/
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── dashboard.html      # Main dashboard
│   ├── browse-tasks.html   # Browse available tasks
│   ├── post-task.html      # Create new task
│   ├── my-tasks.html       # User's tasks (posted & assigned)
│   ├── profile.html        # Current user profile
│   ├── user-profile.html   # Public user profile
│   └── settings.html       # Settings page
└── assets/
    └── icons/              # Icon assets (if needed)
```

## 🔌 API Integration

The application integrates with the backend API at: `https://workbackend-egr6.onrender.com`

### Endpoints Used

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

#### Users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `GET /users/:id/reviews` - Get user's reviews

#### Tasks
- `GET /tasks` - Get all tasks (with query params)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task to self
- `POST /tasks/:id/submit` - Submit task completion
- `POST /tasks/:id/approve` - Approve task with rating
- `GET /tasks/posted` - Get user's posted tasks
- `GET /tasks/assigned` - Get user's assigned tasks

## 🛠️ Setup & Deployment

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser, or serve with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000/`

### Production Deployment

The application is a static site and can be deployed to any static hosting service:

- **Netlify**: Drop the project folder or connect to Git
- **Vercel**: Import repository and set build directory
- **GitHub Pages**: Enable in repository settings
- **AWS S3**: Upload to S3 bucket with static hosting enabled
- **Cloudflare Pages**: Connect repository and deploy

No build process required - just upload the files!

### Environment Configuration

Update the API base URL in `js/api.js` if needed:

```javascript
const API_BASE_URL = 'https://workbackend-egr6.onrender.com';
```

## 🔒 Security Features

- JWT tokens stored securely in localStorage
- Automatic token expiration handling
- HTML sanitization to prevent XSS attacks
- Form validation on client and server side
- HTTPS enforced for API calls
- Input sanitization on all user-generated content

## 📱 Responsive Design

### Mobile (< 768px)
- Bottom navigation bar
- Single column layout
- Touch-optimized buttons (44px min)
- Stacked cards
- Collapsible sections

### Tablet (768px - 1024px)
- Sidebar navigation
- Two-column grids where appropriate
- Larger typography
- Expanded cards

### Desktop (> 1024px)
- Fixed sidebar
- Multi-column grids
- Maximum content width (1200px)
- Hover states and animations

## ⚡ Performance

- Minimal dependencies (no frameworks)
- Optimized CSS with reusable utilities
- Lazy loading for images (if implemented)
- Skeleton loaders for perceived performance
- Efficient DOM manipulation
- Small bundle size (~50KB total)

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- Reduced motion support
- High contrast ratios (WCAG AA compliant)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Code Style

- Clean, commented code
- Consistent naming conventions (camelCase for JS, kebab-case for CSS)
- Modular architecture
- Separation of concerns (UI, data, logic)
- Reusable components and utilities

## 🧪 Testing Recommendations

While no automated tests are included, manual testing should cover:

1. **Authentication Flow**
   - Register new account
   - Login with credentials
   - Session persistence
   - Logout functionality

2. **Task Management**
   - Browse available tasks
   - Create new task
   - Assign task to self
   - Submit work
   - Approve/review work

3. **Profile Management**
   - View own profile
   - Edit profile details
   - View other users' profiles
   - See reviews

4. **Responsive Design**
   - Test on mobile devices
   - Test on tablets
   - Test on desktop
   - Test navigation on different screen sizes

5. **Error Handling**
   - Network errors
   - Invalid inputs
   - Unauthorized access
   - Empty states

## 🔄 Future Enhancements

Potential improvements for future versions:

- Real-time notifications using WebSockets
- Image upload for user avatars
- Task categories and tags
- Search and filter functionality
- Pagination for task lists
- Dark mode toggle
- Email notifications
- Task attachments
- Chat/messaging between users
- Admin dashboard

## 📄 License

This project is part of the WorkExchange platform.

## 👥 Support

For issues or questions, please refer to the main WorkExchange repository or contact the development team.

---

Built with ❤️ using vanilla HTML, CSS, and JavaScript
