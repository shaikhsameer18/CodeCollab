import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: process.env.PORT || 3002, server: 'github-oauth' });
});

// Routes
app.use('/api/auth', authRoutes);

// Add a route to handle callback requests that mistakenly go to port 3000
app.get('/api/auth/github/callback', (req, res) => {
    console.log('Received callback on wrong port, redirecting to correct port');
    const code = req.query.code;
    res.redirect(`http://localhost:3002/api/auth/github/callback?code=${code}`);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.GITHUB_PORT || 3002; // Changed to use a different port

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`GitHub OAuth server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`GitHub callback URL: ${process.env.GITHUB_CALLBACK_URL}`);
}).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});