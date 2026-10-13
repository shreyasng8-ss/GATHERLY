import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { storage } from './storage/storage';
import { eventsRouter } from './routes/events';
import { studentsRouter } from './routes/students';
import { ticketsRouter } from './routes/tickets';
import { tasksRouter } from './routes/tasks';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Allowed origins for CORS (development & production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://gatherly-tau-two.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for prototype deployment while echoing origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());

// Request logger for development
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Gatherly Campus Event Management API',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/tasks', tasksRouter);

// 404 Handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested API route does not exist'
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err?.message || 'An unexpected error occurred'
  });
});

// Start Server function
export async function startServer(port = PORT, host = HOST) {
  try {
    // Initialize persistent storage and seed files if needed
    await storage.init();

    const server = app.listen(port, host, () => {
      console.log(`===============================================`);
      console.log(` Gatherly Backend Server is running!`);
      console.log(` Host:    ${host}`);
      console.log(` Port:    ${port}`);
      console.log(` Local:   http://localhost:${port}`);
      console.log(` Health:  http://localhost:${port}/api/health`);
      console.log(` Events:  http://localhost:${port}/api/events`);
      console.log(` Tickets: http://localhost:${port}/api/tickets/:id/verify`);
      console.log(` Tasks:   http://localhost:${port}/api/tasks`);
      console.log(`===============================================`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Auto-start when executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
