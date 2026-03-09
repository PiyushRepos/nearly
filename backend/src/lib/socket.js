import { Server } from "socket.io";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinBooking", (bookingId) => {
            socket.join(`booking-${bookingId}`);
        });

        socket.on("leaveBooking", (bookingId) => {
            socket.leave(`booking-${bookingId}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}
