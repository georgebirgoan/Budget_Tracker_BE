import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
 
  await prisma.user.upsert({
    where: { email: 'admin@budgettracker.com' },
    update: {},
    create: {
      fullName:"Test",
      email: 'admin@budgettracker.com',
      password: 'hashedpassword',
    },
  });

  console.log('✅ Prisma seed finished');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
