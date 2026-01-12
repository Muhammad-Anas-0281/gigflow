# Environment Variables Setup Guide

## Backend Environment Variables

Create a `.env` file in the `gigflow/backend/` directory with the following variables:

```env
# MongoDB Connection String
# Example: mongodb+srv://<username>:<password>@cluster.mongodb.net/gigflow
MONGO_URI=your_mongodb_connection_string

# JWT Secret Key (use a strong random string)
# Generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SECRET_KEY=your_secure_random_string_here

# Server Port (default: 3000)
PORT=3000

# Frontend URL for CORS configuration
# Example: https://your-frontend-domain.onrender.com
FRONTEND_URL=your_frontend_url_here

# Node Environment
# Options: development, production
NODE_ENV=development
```

## Frontend Environment Variables

Create a `.env` file in the `gigflow/frontend/` directory with the following variables:

```env
# Backend API Base URL
# Example: https://your-backend-service.onrender.com
VITE_API_BASE_URL=your_backend_api_url_here

# Socket.io Server URL
# Usually the same as Backend API URL
VITE_SOCKET_URL=your_backend_api_url_here
```

## Important Notes

1. **Never commit `.env` files to version control**.
2. **Use different secrets for development and production**.
3. **MongoDB URI**: Ensure your IP whitelist includes your deployment provider (e.g., Render, Vercel) or is set to 0.0.0.0/0.
4. **Vite Environment Variables**: Must be prefixed with `VITE_`.

