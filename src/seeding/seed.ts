import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  tls: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'], 
});



async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD; 

  if (!adminEmail || !adminPassword) {
    console.log("Nu s-a setat email-ul sau parola ADMIN in .env!");
    return;
  }

  const nrUseri = await prisma.user.count();
  if (nrUseri > 0) {
    console.log("Exista deja utilizatori in baza de date!");
    return;
  }

  const hashPass = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashPass,
      role: 'ADMIN',
      fullName: "Birgoan George",
    },
  });

  console.log('Admin user creat cu succes! Prisma seed finalizat.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Eroare la seeding:", err);
    await prisma.$disconnect();
    process.exit(1);
  });