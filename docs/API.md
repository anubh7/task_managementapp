# API Documentation

## Base URL
- **Local Development:** `http://localhost:5000/api`
- **Production:** `https://task-managementapp-2.onrender.com/api`

## Authentication

All task-related endpoints require a JWT Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST `/auth/register`

Register a new user.

**Request Body:**
```json
{
  "username": "string (min 3 chars)",
  "password": "string (min 6 chars)"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "string",
  "isAdmin": true,
  "token": "JWT token string",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Username already exists"
}
```

---

### POST `/auth/login`

Log in an existing user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "isAdmin": true,
  "token": "JWT token string",
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid username or password"
}
```

---

## Task Endpoints (Auth Required)

### GET `/tasks`

Get all tasks for the authenticated user.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "completed": false,
    "userId": 1,
    "createdAt": "2026-06-14T07:34:16.302Z"
  }
]
```

---

### POST `/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "string (required)"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": false,
  "userId": 1,
  "createdAt": "2026-06-14T07:34:16.302Z"
}
```

**Error Response (400):**
```json
{
  "message": "Title is required"
}
```

---

### PUT `/tasks/:id`

Update a task (mark completed, change title).

**Request Parameters:**
- `id` — Task ID (integer)

**Request Body:**
```json
{
  "title": "string (optional)",
  "completed": true/false (optional)
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "completed": true,
  "userId": 1,
  "createdAt": "2026-06-14T07:34:16.302Z"
}
```

**Error Response (404):**
```json
{
  "message": "Task not found"
}
```

---

### DELETE `/tasks/:id`

Delete a task.

**Request Parameters:**
- `id` — Task ID (integer)

**Success Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Response (404):**
```json
{
  "message": "Task not found"
}
```

---

## Location Endpoints (Auth Required)

### POST `/tasks/location`

Update the authenticated user's location.

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Success Response (200):**
```json
{
  "message": "Location updated",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "updatedAt": "2026-06-14T07:34:16.302Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Latitude and longitude must be numbers"
}
```

---

### GET `/tasks/location`

Get the authenticated user's location.

**Success Response (200):**
```json
{
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "updatedAt": "2026-06-14T07:34:16.302Z"
  }
}
```

**Success Response (200, no location):**
```json
{
  "location": null
}
```

---

### GET `/tasks/location/all`

Get all users' shared locations (admin only).

**Success Response (200):**
```json
{
  "locations": [
    {
      "id": 1,
      "username": "anubhavgg",
      "location": {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "updatedAt": "2026-06-14T07:34:16.302Z"
      }
    }
  ]
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden: admin access required"
}
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Unauthorized — invalid or expired token |
| 403 | Forbidden — admin access required |
| 404 | Route not found |
| 500 | Internal server error |