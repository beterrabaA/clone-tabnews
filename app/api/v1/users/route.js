import { NextResponse } from "next/server";
import erros from "@/infra/errors";
import user from "@/models/user";
import { custom405 } from "../status/route";

const { InternalServerError } = erros;

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
    const errorClasses = Object.values(erros).map((err) => err.name);
    if (
      errorClasses.includes(error.name) &&
      !(error instanceof erros.InternalServerError)
    ) {
      return NextResponse.json(error, { status: error.statusCode });
    }

    const publicErrorObject = new InternalServerError({
      cause: error,
      code: error?.statusCode,
    });
    console.error(
      "\n<===> Controller Error <===> Error fetching users:",
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
