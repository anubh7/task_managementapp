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
