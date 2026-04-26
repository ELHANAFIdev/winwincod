import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.withdrawalrequest.findMany();
  console.log(reqs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
