import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { storage } from './storage/storage';
import { eventsRouter } from './routes/events';
import { studentsRouter } from './routes/students';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(cors());
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
    service: 'Gatherly Event Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/students', studentsRouter);

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
export async function startServer(port = PORT) {
  try {
    // Initialize persistent storage and seed files if needed
    await storage.init();

    const server = app.listen(port, () => {
      console.log(`===============================================`);
      console.log(` Gatherly Backend Server is running!`);
      console.log(` Port:    http://localhost:${port}`);
      console.log(` Health:  http://localhost:${port}/api/health`);
      console.log(` Events:  http://localhost:${port}/api/events`);
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
