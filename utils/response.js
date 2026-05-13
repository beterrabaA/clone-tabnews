import { NextResponse } from "next/server";
import errors from "@/infra/errors";

const { InternalServerError, MethodNotAllowedError } = errors;

export function custom405() {
  const methodNotAllowedError = new MethodNotAllowedError();
  return new NextResponse(JSON.stringify(methodNotAllowedError), {
    status: methodNotAllowedError.statusCode,
  });
}

export function custom500(error) {
  const errorClasses = Object.values(errors).map((err) => err.name);
  const isInternalServerError = error instanceof InternalServerError;
  if (errorClasses.includes(error.name) && !isInternalServerError) {
    return NextResponse.json(error, { status: error.statusCode });
  }

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
