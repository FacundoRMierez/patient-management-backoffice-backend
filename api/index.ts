// Vercel Serverless Function Entry Point
import app from '../src/index';
import prisma from '../src/database/prisma';

// Ensure database connection on cold start
prisma.$connect().catch((err) => {
  console.error('Database connection error:', err);
});

export default app;
