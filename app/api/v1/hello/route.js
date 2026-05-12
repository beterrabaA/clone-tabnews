import { NextResponse } from "next/server";
import { custom405 } from "../status/route";

export async function GET() {
  return NextResponse.json({ message: "Hello, World!" });
}

export async function POST() {
  return custom405();
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
