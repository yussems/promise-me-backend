# Authentication System

This authentication system provides JWT-based authentication with refresh tokens for secure user management.

## Features

- User registration with email and password
- Secure password hashing using bcrypt
- JWT access tokens (15 minutes) and refresh tokens (7 days)
- Token refresh functionality
- Secure logout with token invalidation
- Token verification middleware
- Comprehensive input validation using Zod
- TypeScript support with full type safety

## API Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 201
}
```

### POST /auth/login

Authenticate user and receive access and refresh tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "statusCode": 200
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

### POST /auth/logout

Logout user and invalidate refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "statusCode": 200
}
```

### GET /auth/verify

Verify access token and get user information.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "userId": "user_id"
  },
  "statusCode": 200
}
```

## Middleware

### authenticateToken

Protect routes that require authentication.

```typescript
import { authenticateToken } from "@/common/middleware/authMiddleware";

// Protected route
app.get("/protected", authenticateToken, (req, res) => {
  // req.user.userId contains the authenticated user's ID
  res.json({ message: "Protected data" });
});
```

### optionalAuth

Optional authentication middleware that adds user info if token is provided.

```typescript
import { optionalAuth } from "@/common/middleware/authMiddleware";

// Optional authentication
app.get("/public", optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({ message: "Hello authenticated user" });
  } else {
    // User is not authenticated
    res.json({ message: "Hello guest" });
  }
});
```

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Token Invalidation**: Refresh tokens are invalidated on logout
- **Input Validation**: All inputs are validated using Zod schemas
- **Rate Limiting**: Built-in rate limiting for all endpoints
- **CORS**: Configurable CORS settings
- **Helmet**: Security headers via Helmet middleware

## Error Handling

The system provides consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "statusCode": 400
}
```

Common error status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/tokens)
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

## Testing

Run the authentication tests:

```bash
npm test src/api/auth/__tests__/
```

## Usage Example

```typescript
// 1. Register a new user
const registerResponse = await fetch("/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  }),
});

// 2. Login to get tokens
const loginResponse = await fetch("/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const { accessToken, refreshToken } = loginResponse.data.tokens;

// 3. Use access token for authenticated requests
const protectedResponse = await fetch("/protected-endpoint", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// 4. Refresh token when access token expires
const refreshResponse = await fetch("/auth/refresh", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken }),
});

// 5. Logout when done
await fetch("/auth/logout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refreshToken }),
});
```
