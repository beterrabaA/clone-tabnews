import { version as uuidVersion } from "uuid";

import webserver from "@/infra/webserver";
import {
  waitForAllServices,
  createSession,
  createUser,
  clearDatabase,
  runPendingMigrations,
} from "@/tests/orchestrator";
import session from "@/models/session";
import { parseCookies } from "@/utils/cookie";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("Attempting to get to users endpoint, should return 405", async () => {
      const body = await fetch(`${webserver.getOrigin}/api/v1/users`);

      expect(body.status).toBe(405);

      const responseJson = await body.json();

      expect(responseJson).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        status_code: 405,
        action:
          "Verifique se o método HTTP utilizado é permitido para este endpoint e corrija a requisição.",
      });
    });
  });

  describe("Default user", () => {
    test("With valid session, should return 200", async () => {
      const createdUser = await createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await createSession(createdUser.id);

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControlHeader = response.headers.get("Cache-Control");

      expect(cacheControlHeader).toBe(
        "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
      );

      const body = await response.json();

      expect(body).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      });

      expect(uuidVersion(body.id)).toBe(7);
      expect(Date.parse(body.createdAt)).not.toBeNaN();
      expect(Date.parse(body.updatedAt)).not.toBeNaN();
    });
    test("With invalid session, should return 401", async () => {
      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        headers: {
          Cookie: `session_id=invalid_session_token`,
        },
      });

      expect(response.status).toBe(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        status_code: 401,
        action:
          "Verifique se a sessão é válida e tente novamente. Caso o problema persista, entre em contato com o suporte.",
      });
    });
    test("With non-existent session, should return 401", async () => {
      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        headers: {
          Cookie: `session_id=non_existent_session_token`,
        },
      });

      expect(response.status).toBe(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        status_code: 401,
        action:
          "Verifique se a sessão é válida e tente novamente. Caso o problema persista, entre em contato com o suporte.",
      });
    });
    test("With expired session, should return 401", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_MILLISECONDS),
      });

      const createdUser = await createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        status_code: 401,
        action:
          "Verifique se a sessão é válida e tente novamente. Caso o problema persista, entre em contato com o suporte.",
      });
    });
    test("Verify if the session is renewed after a successful request", async () => {
      const createdUser = await createUser({
        username: "UserWithSessionRenewal",
      });

      const sessionObject = await createSession(createdUser.id);

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: createdUser.id,
        username: "UserWithSessionRenewal",
        email: createdUser.email,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      });

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expiresAt.getTime()).toBeGreaterThan(
        sessionObject.expiresAt.getTime(),
      );
      expect(renewedSessionObject.updatedAt.getTime()).toBeGreaterThan(
        sessionObject.updatedAt.getTime(),
      );

      // Session Assertions
      const cookieString = response.headers.getSetCookie();
      const emyCookie = parseCookies(cookieString);

      expect(emyCookie).toEqual({
        name: emyCookie.name,
        value: sessionObject.token,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(renewedSessionObject.expiresAt).toUTCString(),
        domain: webserver.getOrigin,
      });
    });
  });
});
