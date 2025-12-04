import { Router } from 'express';
import userRoutes from './user.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/users', userRoutes);

export default router;
