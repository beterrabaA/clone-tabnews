import { NextResponse } from "next/server";
import errors from "@/infra/errors";
import migrator from "@/models/migrator.js";
import { custom405 } from "../status/route";

const { InternalServerError } = errors;

export async function GET() {
  try {
    const pendingMigrations = await migrator.runMigrations(true);
    return NextResponse.json(pendingMigrations);
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    console.error(
      "\n<===> Controller Error <===> Error fetching pending migrations:",
      publicErrorObject,
    );
    return NextResponse.json(publicErrorObject, {
      status: publicErrorObject.statusCode,
    });
  }
}

export async function POST() {
  try {
    const migratedMigrations = await migrator.runMigrations(false);
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
export async function PATCH() {
  return custom405();
}
export async function DELETE() {
  return custom405();
}
