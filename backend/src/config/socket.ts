import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

    io = new SocketServer(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                const normalizedOrigin = origin.replace(/\/$/, '');
                const isAllowed = allowedOrigins.some(ao => ao.replace(/\/$/, '') === normalizedOrigin);

                if (isAllowed || process.env.NODE_ENV === 'development') {
                    callback(null, true);
                } else {
                    console.warn(`🔌 Socket.io CORS denied: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
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
