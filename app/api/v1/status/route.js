import database from "@/infra/database";
import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const updatedAt = new Date().toISOString();

    const databaseVersionResult = await database.query("SHOW server_version;");
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionsValue =
      await databaseMaxConnectionsResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    return NextResponse.json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    console.log(error);

    const publicErrorObject = new InternalServerError({
      cause: error,
      code: error?.statusCode,
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
  return custom405();
}
export async function PUT() {
  return custom405();
}
export async function DELETE() {
  return custom405();
}

export function custom405() {
  const methodNotAllowedError = new MethodNotAllowedError();
  return new NextResponse(JSON.stringify(methodNotAllowedError), {
    status: methodNotAllowedError.statusCode,
  });
}
