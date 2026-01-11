import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
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

// Routes
import showcaseRoutes from './routes/showcase';
import managementRoutes from './routes/management';
import oauthRoutes from './routes/auth/oauth.routes';
import passport from './config/passport';

// Initialize Passport
app.use(passport.initialize());

app.use('/api/showcase', showcaseRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/auth', oauthRoutes);


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

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);

    // Test database connection
    try {
        const pool = (await import('./config/database')).default;
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully!');
        console.log(`📅 Database time: ${result.rows[0].now}`);
    } catch (error: any) {
        console.error('❌ Database connection failed!');
        console.error('Error:', error.message);
    }
});

export default app;
