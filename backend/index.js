import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import authRoute from "./routes/auth.route.js";
import gigRoute from "./routes/gig.route.js";
import bidRoute from "./routes/bid.route.js";
import jwt from "jsonwebtoken";
import { User } from "./models/user.model.js";

dotenv.config({});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
});

// Store user socket mappings
const userSocketMap = {};

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        // Get token from cookies instead of auth
        const token = socket.handshake.headers.cookie?.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decode.userId);
        if (!user) {
            return next(new Error("User not found"));
        }
        socket.userId = user._id.toString();
        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    
    // Map user ID to socket ID
    userSocketMap[socket.userId] = socket.id;
    
    // Join room for user-specific notifications
    socket.join(socket.userId);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
        delete userSocketMap[socket.userId];
    });
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// API routes
app.use("/api/auth", authRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/bids", bidRoute);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "GigFlow API is running" });
});

httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Server running at port ${PORT}`);
});

