import { NextResponse } from "next/server";
import { custom405 } from "../../status/route";
import user from "@/models/user";
import errors from "@/infra/errors";

const { InternalServerError } = errors;

export async function GET(request, { params }) {
  const { username } = await params;
  try {
    const data = await user.findOneByUsername(username);
    return NextResponse.json(data);
  } catch (error) {
    const errorClasses = Object.values(errors).map((err) => err.name);
    if (
      errorClasses.includes(error.name) &&
      !(error instanceof errors.InternalServerError)
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

export async function POST() {
  return custom405();
}

export async function PUT() {
  return custom405();
}

export async function DELETE() {
  return custom405();
}

export async function PATCH() {
  return custom405();
}
