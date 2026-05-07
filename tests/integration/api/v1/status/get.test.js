import webserver from "@/infra/webserver";
import {
  startDatabase,
  stopDatabase,
  waitForAllServices,
} from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

afterAll(() => {
  startDatabase();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current status, should return 200", async () => {
      const response = await fetch(`${webserver.getOrigin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database.version).toEqual("18.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });

    test("Retrieving status with database error, should return 503", async () => {
      stopDatabase();
      const response = await fetch(`${webserver.getOrigin}/api/v1/status`);

      const responseJson = await response.json();

      expect(response.status).toBe(503);

      expect(responseJson).toEqual({
        name: "InternalServerError",
        message:
          "Um erro interno não esperado aconteceu. Tente novamente mais tarde.",
        status_code: 503,
        action: "Se o erro persistir, entre em contato com o suporte.",
      });

      startDatabase();
    });
  });
});
