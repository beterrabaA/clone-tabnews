import { resolve } from "path";
import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { ServiceUnavailableError } from "@/infra/errors";

async function runMigrations(dryRun) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      dryRun,
      direction: "up",
      verbose: process.env.NODE_ENV === "development",
      migrationsTable: "pgmigrations",
    };

    return await migrationRunner(defaultMigrationOptions);
  } catch (error) {
    const serviceError = new ServiceUnavailableError({
      message: "Erro ao executar a consulta no banco de dados.",
      cause: error,
    });
    console.error(
      "\n<===> Database Error <===> An error occurred while executing a database query:",
      serviceError,
    );
    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  runMigrations,
};

export default migrator;
