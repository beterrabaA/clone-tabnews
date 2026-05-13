import { NextResponse } from "next/server";
import user from "@/models/user";
import { custom405, custom500 } from "@/utils/response";

export async function GET() {
  return custom405();
}

export async function POST(request) {
  const body = await request.json();
  const { username, email, password } = body;
  try {
    const data = await user.create(username, email, password);
    return NextResponse.json(data, { status: 201 });
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
