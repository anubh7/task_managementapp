# Setup Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm (included with Node.js)

## Project Structure

```
task_managementapp/
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.js        # Entry point
│   │   ├── db.js            # Database initialization (lowdb)
│   │   ├── models/          # User and Task models
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # Express routers
│   │   └── middleware/      # JWT auth middleware
│   ├── data/db.json         # JSON file database
│   └── .env                 # Environment variables
├── frontend/         # Vanilla JS frontend
│   ├── public/
│   │   ├── index.html       # Main HTML
│   │   ├── index.js         # Application logic
│   │   └── index.css        # Styles
│   └── src/
│       └── index.js         # Alternate source copy
└── docs/             # Documentation
```

## Local Development

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your own values:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-random-secret-key-here
   ADMIN_USERNAME=anubhavgg
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. API is available at `http://localhost:5000`

### Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser

> **Note:** The frontend automatically detects whether it is running on localhost or in production and points to the correct API URL.

## Deployment

### Render (Recommended)

The project includes `render.yaml` configuration files for both backend and frontend:

1. Push to GitHub
2. Connect your repo on [Render](https://render.com)
3. Backend will start on `npm start` (runs `node src/server.js`)
4. Frontend is served as static files

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `JWT_SECRET` | Secret key for JWT signing | `very-long-random-string` |
| `ADMIN_USERNAME` | Admin user for location tracking | `anubhavgg` |

## Database

- Uses [lowdb](https://github.com/typicode/lowdb) with JSON file storage
- Database file: `backend/data/db.json`
- Auto-creates database on first startup
- Stores `users` and `tasks` arrays

## Authentication

- JWT-based authentication with 12-hour token expiry
- Tokens include: `userId`, `username`, `isAdmin`
- Include token in requests: `Authorization: Bearer <token>`