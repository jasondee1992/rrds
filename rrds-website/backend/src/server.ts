import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Prisma connected to SQLite");

    const server = app.listen(env.PORT, () => {
      console.log(`RRDS API server running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      await prisma.$disconnect();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start RRDS API server", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();
