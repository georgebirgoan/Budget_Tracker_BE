// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// export function createPrismaClient() {
//   if (!process.env.DATABASE_URL) {
//     throw new Error("DATABASE_URL is missing");
//   }

//   const adapter = new PrismaPg({
//     connectionString: process.env.DATABASE_URL,
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   return new PrismaClient({
//     adapter,
//     log: ['query', 'info', 'warn', 'error'],
//   });
// }
