import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { isDevelopment } from '../config';

// Create connection pool for Neon database
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prisma Client instance with adapter
const prisma = new PrismaClient({
  adapter,
  log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
