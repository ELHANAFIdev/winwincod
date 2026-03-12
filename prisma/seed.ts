const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 🔐 Admin
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@winwincod.com' },
    update: {},
    create: {
      email: 'admin@winwincod.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      wallet: {
        create: { balance: 0 },
      },
    },
  });

  console.log('✅ Admin created', admin.email);

  // 📞 Call Center Agent
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@winwincod.com' },
    update: {},
    create: {
      email: 'agent@winwincod.com',
      name: 'Call Center Agent 1',
      password: await bcrypt.hash('agent123', 10),
      role: 'CALL_CENTER',
      isActive: true,
    },
  });

  console.log('✅ Agent created', agentUser.email);

  // 🛒 Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      email: 'seller@test.com',
      name: 'Test Seller',
      password: await bcrypt.hash('123456', 10),
      role: 'SELLER',
      isActive: true,
      wallet: {
        create: { balance: 0 },
      },
    },
  });

  console.log('✅ Seller created', seller.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seeding finished successfully');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
