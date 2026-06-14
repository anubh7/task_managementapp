# Features

## Core Features

### User Authentication
- **Register** — Create a new account with username (min 3 characters) and password (min 6 characters)
- **Login** — Log in with existing credentials
- **JWT Sessions** — Secure token-based authentication with 12-hour expiry
- **Admin Role** — Designated admin user with elevated permissions for location tracking

### Task Management
- **Create Tasks** — Add new tasks with a title
- **View Tasks** — See all your tasks in a clean list
- **Toggle Completion** — Mark tasks as complete or incomplete with a checkbox
- **Delete Tasks** — Remove tasks with confirmation prompt
- **User Isolation** — Each user can only see and manage their own tasks

### Location Tracking (Admin)
- **Live Location Sharing** — Continuously share your GPS location with the server
- **Interactive Map** — View your location on a Leaflet/OpenStreetMap map
- **Location History** — See the last shared location on login
- **Shared Locations Panel** — Admin can view all users' locations with timestamps
- **Toggle Tracking** — Start and stop location tracking at any time

## UI Features

### Animated Quotes Background
- Rotating motivational quotes displayed in the background
- Smooth fade animations with 8-second cycle
- Quotes from Mark Twain, Walt Disney, Zig Ziglar, and more

### Glassmorphism Design
- Modern frosted glass effect on card containers
- Gradient buttons with hover animations
- Smooth transitions and hover states
- Dark theme with purple/blue accent colors

### Responsive Layout
- Centered card layout with max-width constraint
- Flexible header with wrapping for small screens
- Scrollable task list

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Map Library | Leaflet.js with OpenStreetMap tiles |
| Backend | Node.js, Express.js |
| Database | lowdb (JSON file-based) |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Deployment | Render |

## Security

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Admin-only endpoints protected with role checks
- No sensitive data stored in localStorage (only token, username, isAdmin)