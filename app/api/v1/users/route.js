import { NextResponse } from "next/server";
import user from "@/models/user";
import { custom405, custom500 } from "@/utils/response";
import { cookies } from "next/headers";
import session from "@/models/session";
import webserver from "@/infra/webserver";

export async function GET() {
  const cookieStore = await cookies();
  try {
    const hasSession = cookieStore.has("session_id");
    if (!hasSession) return custom405();

    const sessionToken = cookieStore.get("session_id").value;
    const sessionObject = await session.findOneValidByToken(sessionToken);

    await session.renew(sessionObject.id);
    const currUser = await user.findOneById(sessionObject.userId);

    const response = NextResponse.json(currUser, { status: 200 });
    response.cookies.set({
      name: "session_id",
      value: sessionToken,
      path: "/",
      httpOnly: true,
      domain: webserver.getOrigin,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: sessionObject.expiresAt,
    });

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
    );

    return response;
  } catch (error) {
    return custom500(error);
  }
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
