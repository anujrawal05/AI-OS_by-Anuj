const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const user = await prisma.user.findUnique({ where: { email: 'aios-sprint-test-01@example.com' } });
  if (!user) { console.log('NO_USER'); process.exit(0); }
  const ev = await prisma.emailVerification.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  console.log('OTP:', ev ? ev.code : 'NONE');
  await prisma.$disconnect();
})();
