import { NextResponse } from "next/server";

import authenticaion from "@/models/authentication";
import session from "@/models/session";
import { custom405, custom500 } from "@/utils/response";
import webserver from "@/infra/webserver";

export async function GET() {
  return custom405();
}

export async function POST(request) {
  const body = await request.json();
  try {
    const userData = await authenticaion.getUser(body);

    const sessionData = await session.create(userData.id);

    const response = NextResponse.json(sessionData, { status: 201 });
    response.cookies.set({
      name: "session_id",
      value: sessionData.token,
      path: "/",
      httpOnly: true,
      domain: webserver.getOrigin,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: sessionData.expiresAt,
    });
    return response;
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
