import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './config/socket';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.get('/api', (_req: Request, res: Response) => {
    res.json({
        message: 'GreenAcres Farm Management API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    });
});

import showcaseRoutes from './routes/showcase';
import managementRoutes from './routes/management';
import oauthRoutes from './routes/auth/oauth.routes';
import payrollRoutes from './routes/payroll.routes';
import notificationRoutes from './routes/notification.routes';
import passport from './config/passport';

// Initialize Passport
app.use(passport.initialize());

app.use('/showcase', showcaseRoutes);
app.use('/management', managementRoutes);
app.use('/auth', oauthRoutes);
app.use('/payroll', payrollRoutes);
app.use('/notifications', notificationRoutes);


// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// Initialize Socket.io
initSocket(server);

// Cấu hình timeouts cho Server để tránh treo kết nối khi trình duyệt chuyển trang nhanh
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000;   // 66 seconds

// Phào cứu sinh cho Process: Ngăn chặn crash sập server khi gặp lỗi không bắt được
process.on('uncaughtException', (err) => {
    console.error('🔥 CRITICAL: Uncaught Exception:', err);
    // Không thoát process để PM2 không phải restart liên tục gây CONNECTION_REFUSED
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log('');

    // Test database connection asynchronously to prevent startup hang
    const testDbConnection = async () => {
        try {
            const pool = (await import('./config/database')).default;
            // Sử dụng timeout ngắn cho việc check
            await pool.query('SELECT NOW()');
            console.log('✅ Database connected successfully!');
        } catch (error: any) {
            console.error('⚠️ Database connection check failed (will retry automatically):', error.message);
        }
    };
    testDbConnection();

    // Initialize backup scheduler
    try {
        const { BackupSchedulerService } = await import('./services/backup-scheduler.service');
        BackupSchedulerService.initialize();
    } catch (error: any) {
        console.error('❌ Backup scheduler initialization failed!');
    }
});

export default app;
