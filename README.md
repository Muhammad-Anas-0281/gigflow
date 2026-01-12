# GigFlow - Freelance Marketplace Platform

GigFlow is a mini-freelance marketplace platform where Clients can post jobs (Gigs) and Freelancers can apply for them (Bids).

## Features

- ✅ User Authentication (Sign-up and Login with JWT HttpOnly cookies)
- ✅ Gig Management (CRUD operations)
- ✅ Browse Gigs with Search/Filter
- ✅ Bid Submission
- ✅ Hiring Logic with MongoDB Transactions (Race Condition Prevention)
- ✅ Real-time Notifications using Socket.io

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS + Redux Toolkit
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **State Management**: Redux Toolkit with Redux Persist
- **Authentication**: JWT with HttpOnly cookies
- **Real-time**: Socket.io

## Project Structure

```
gigflow/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── gig.controller.js
│   │   └── bid.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── gig.model.js
│   │   └── bid.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── gig.route.js
│   │   └── bid.route.js
│   ├── middlewares/
│   │   └── isAuthenticated.js
│   ├── utils/
│   │   └── db.js
│   └── index.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── shared/
    │   │   └── ui/
    │   ├── hooks/
    │   ├── redux/
    │   └── utils/
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd gigflow/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key_here
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd gigflow/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & set HttpOnly Cookie
- `GET /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs` - Fetch all open gigs (with search query)
- `POST /api/gigs` - Create a new job post
- `GET /api/gigs/my-gigs` - Get current user's gigs
- `GET /api/gigs/:id` - Get gig by ID

### Bids
- `POST /api/bids/:gigId` - Submit a bid for a gig
- `GET /api/bids/:gigId` - Get all bids for a specific gig (Owner only)
- `GET /api/bids/my-bids` - Get current user's bids
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (Atomic update with transaction)

## Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key
- `PORT` - Server port (default: 3000)
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## Key Features Implementation

### 1. Transactional Integrity (Race Condition Prevention)
The hiring logic uses MongoDB Transactions to ensure atomicity. When a client clicks "Hire":
- All operations (marking gig as assigned, bid as hired, other bids as rejected) happen in a single transaction
- If two users try to hire simultaneously, only one will succeed
- The second request will see the gig is already assigned and be rejected

### 2. Real-time Notifications
- Socket.io is integrated for real-time communication
- When a freelancer is hired, they receive an instant notification
- No page refresh required

## Deployment

### Backend Deployment
1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible
3. Deploy and update `FRONTEND_URL` to your frontend domain

### Frontend Deployment
1. Set environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_SOCKET_URL` - Your Socket.io server URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting platform

## Notes

- Make sure MongoDB is running and accessible
- CORS is configured for the frontend URL
- HttpOnly cookies are used for secure authentication
- Socket.io requires authentication token for connection

