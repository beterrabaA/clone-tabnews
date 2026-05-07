import { NextResponse } from "next/server";
import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";
import migrator from "@/models/migrator.js";

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
export async function DELETE() {
  return custom405();
}

function custom405() {
  const methodNotAllowedError = new MethodNotAllowedError();
  return new NextResponse(JSON.stringify(methodNotAllowedError), {
    status: methodNotAllowedError.statusCode,
  });
}
