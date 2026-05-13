import { NextResponse } from "next/server";
import migrator from "@/models/migrator.js";
import { custom405, custom500 } from "@/utils/response";

export async function GET() {
  try {
    const pendingMigrations = await migrator.runMigrations(true);
    return NextResponse.json(pendingMigrations);
  } catch (error) {
    return custom500(error);
  }
}

export async function POST() {
  try {
    const migratedMigrations = await migrator.runMigrations(false);
    const status = migratedMigrations.length > 0 ? 201 : 200;
    return NextResponse.json(migratedMigrations, { status });
  } catch (error) {
    return custom500(error);
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
