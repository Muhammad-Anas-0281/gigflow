import { io } from "socket.io-client";
import { SOCKET_URL } from "./constant";

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true  // Cookies will be sent automatically
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.log("Socket connection error:", error);
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    return socket;
};

