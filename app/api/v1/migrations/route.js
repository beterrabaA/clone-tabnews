import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import database from "infra/database.js";
import { NextResponse } from "next/server";

async function runMigrations(dryRun) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      dryRun,
      direction: "up",
      migrationsTable: "pgmigrations",
    };

    return await migrationRunner(defaultMigrationOptions);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

export async function GET() {
  try {
    const pendingMigrations = await runMigrations(true);
    return NextResponse.json(pendingMigrations, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const migratedMigrations = await runMigrations(false);
    const status = migratedMigrations.length > 0 ? 201 : 200;
    return NextResponse.json(migratedMigrations, { status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
