# Task Management Backend

Express backend API for the Task Management App.

## Run locally
1. Open a terminal in `backend`
2. Run `npm install`
3. Run `npm start`
4. API will be available at `http://localhost:5000`

Endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Authentication uses JWT tokens.
Set `JWT_SECRET` in `.env` or your environment.

## Deploying to Render
1. Push this repo to GitHub.
2. In Render, create a new Web Service and connect the repo.
3. Set the repo root to `backend` or use the supplied `render.yaml`.
4. Use these commands:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add `JWT_SECRET` to the Render service environment variables.

Render will automatically use the `PORT` value provided by the platform.
