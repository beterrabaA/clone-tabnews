import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import database from "infra/database.js";
import { NextResponse } from "next/server";
import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";

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
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.error(
      "\n<===> Controller Error <===> Error fetching status:",
      publicErrorObject,
    );
    return NextResponse.json(publicErrorObject, {
      status: publicErrorObject.statusCode,
    });
  }
}

export async function POST() {
  try {
    const migratedMigrations = await runMigrations(false);
    const status = migratedMigrations.length > 0 ? 201 : 200;
    return NextResponse.json(migratedMigrations, { status });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.error(
      "\n<===> Controller Error <===> Error running migrations:",
      publicErrorObject,
    );
    return NextResponse.json(publicErrorObject, {
      status: publicErrorObject.statusCode,
    });
  }
}

export async function PUT() {
  return custom405();
}
export async function DELETE() {
  return custom405();
}

function custom405() {
  const methodNotAllowedError = new MethodNotAllowedError();
  return new NextResponse(JSON.stringify(methodNotAllowedError), {
    status: methodNotAllowedError.statusCode,
  });
}
