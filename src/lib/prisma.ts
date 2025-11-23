import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = new PrismaClient();

// ... (rest of the code remains the same)

declare const globalThis: {
  prismaGlobal: PrismaClient;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
