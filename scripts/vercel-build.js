import { execSync } from 'child_process';

console.log('🚀 Running Vercel Custom Build Script...');

// Set dummy DATABASE_URL if it is not present (required by Prisma during client compilation)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
  console.log('⚠️ DATABASE_URL not found during build. Injected dummy URL for Prisma client compilation.');
}

try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate --schema=./backend/prisma/schema.prisma', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Prisma client generation failed:', error.message);
  process.exit(1);
}
