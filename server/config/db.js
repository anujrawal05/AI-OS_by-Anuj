const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Avoid creating multiple PrismaClient instances in development due to hot-reloading
  if (!global.prismaClientGlobal) {
    global.prismaClientGlobal = new PrismaClient();
  }
  prisma = global.prismaClientGlobal;
}

module.exports = prisma;
