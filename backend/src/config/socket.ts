import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://163.223.8.88'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        socket.on('join_comment_room', (room) => {
            socket.join(room);
            console.log(`🏠 User ${socket.id} joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitToRoom = (room: string, event: string, data: any) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};
