# Environment Variables Setup Guide

## Backend Environment Variables

Create a `.env` file in the `gigflow/backend/` directory with the following variables:

```env
# MongoDB Connection String
# Format: mongodb://localhost:27017/gigflow
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/gigflow
MONGO_URI=your_mongodb_connection_string

# JWT Secret Key (use a strong random string)
# Generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SECRET_KEY=your_secret_key_here

# Server Port (default: 3000)
PORT=3000

# Frontend URL for CORS configuration
# Local: http://localhost:5173
# Production: https://your-frontend-domain.com
FRONTEND_URL=http://localhost:5173

# Node Environment
# Options: development, production
NODE_ENV=development
```

### Example Backend .env:
```env
MONGO_URI=mongodb://localhost:27017/gigflow
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Frontend Environment Variables

Create a `.env` file in the `gigflow/frontend/` directory with the following variables:

```env
# Backend API Base URL
# Local: http://localhost:3000
# Production: https://your-backend-api.com
VITE_API_BASE_URL=http://localhost:3000

# Socket.io Server URL
# Local: http://localhost:3000
# Production: https://your-backend-api.com
VITE_SOCKET_URL=http://localhost:3000
```

### Example Frontend .env:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Production Deployment

### Backend Production .env:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow
SECRET_KEY=your_production_secret_key_here
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend Production .env:
```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_SOCKET_URL=https://your-backend-api.com
```

## Important Notes

1. **Never commit `.env` files to version control** - They contain sensitive information
2. **Use different secrets for development and production**
3. **MongoDB URI**: 
   - Local MongoDB: `mongodb://localhost:27017/gigflow`
   - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/gigflow`
4. **SECRET_KEY**: Should be a long, random string. Use a password generator or crypto library
5. **CORS**: Make sure `FRONTEND_URL` matches your actual frontend domain
6. **Vite Environment Variables**: Must be prefixed with `VITE_` to be accessible in the frontend code

## Quick Setup Commands

### Generate a secure SECRET_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Copy example files (if they exist):
```bash
# Backend
cp gigflow/backend/.env.example gigflow/backend/.env

# Frontend
cp gigflow/frontend/.env.example gigflow/frontend/.env
```

Then edit the `.env` files with your actual values.

