import { NextResponse } from "next/server";
import user from "@/models/user";
import { custom405, custom500 } from "@/utils/response";

export async function GET(request, { params }) {
  const { username } = await params;
  try {
    const data = await user.findOneByUsername(username);
    delete data.password;
    return NextResponse.json(data);
  } catch (error) {
    return custom500(error);
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

export async function PATCH(request, { params }) {
  const { username } = await params;
  const body = await request.json();
  try {
    const updatedUser = await user.update(username, body);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return custom500(error);
  }
}
