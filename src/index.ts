import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import prisma from './database/prisma';

// ============================================
// EXPRESS APP SETUP
// ============================================

const app: Application = express();

// ============================================
// MIDDLEWARES
// ============================================

// CORS configuration
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (config.nodeEnv === 'development') {
  app.use((req: Request, _res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Patient Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      docs: '/api-docs',
    },
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Patient Management API Docs',
}));

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// ERROR HANDLER (Must be last)
// ============================================
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
