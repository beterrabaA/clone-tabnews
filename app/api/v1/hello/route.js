import { custom405 } from "@/utils/response";
import { NextResponse } from "next/server";

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
