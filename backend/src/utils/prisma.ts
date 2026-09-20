import "../config/index.js";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

const databaseUrl =
  config.databaseUrl ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/nayantara_opticals?schema=public";

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: config.isProduction ? ["error", "warn"] : ["error", "warn"],
  });

if (!config.isProduction) {
  global.prismaInstance = prisma;
}
