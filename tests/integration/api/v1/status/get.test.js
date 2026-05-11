import database from "@/infra/database";
import webserver from "@/infra/webserver";
import { fetchStatus } from "@/lib/actions";
import { waitForAllServices } from "@/tests/orchestrator";
import errors from "@/infra/errors";

const { InternalServerError, ServiceUnavailableError } = errors;

beforeAll(async () => {
  await waitForAllServices();
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

    test("Retrieving status with database unavailable", async () => {
      const serviceError = new ServiceUnavailableError({
        message: "Database is down",
        action:
          "Please try again later or contact support if the issue persists.",
      });
      jest.spyOn(database, "query").mockImplementation(() => {
        throw new InternalServerError({
          cause: serviceError,
          code: serviceError.statusCode,
        });
      });

      const responseJson = await fetchStatus().catch((error) => {
        return {
          name: error.name,
          message: error.message,
          status_code: error.statusCode,
          action: error.action,
        };
      });

      expect(responseJson).toEqual({
        name: "InternalServerError",
        message:
          "Um erro interno não esperado aconteceu. Tente novamente mais tarde.",
        status_code: 503,
        action: "Se o erro persistir, entre em contato com o suporte.",
      });

      expect(database.query).toHaveBeenCalledTimes(1);
    });
  });
});
