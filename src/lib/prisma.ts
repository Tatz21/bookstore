import { PrismaClient } from "@prisma/client";
import { createDemoPrismaClient, shouldUseDemoStore } from "./demo-store";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (shouldUseDemoStore()) {
    return createDemoPrismaClient() as unknown as PrismaClient;
  }

  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma: PrismaClient = getClient();
