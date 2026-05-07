import webserver from "@/infra/webserver";
import { waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("PUT /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Attempting to put on migrations endpoint, should return 405", async () => {
      const responseBody = await fetch(
        `${webserver.getOrigin}/api/v1/migrations`,
        {
          method: "PUT",
        },
      );

      const responseJson = await responseBody.json();

      expect(responseBody.status).toBe(405);

      expect(responseJson).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        status_code: 405,
        action:
          "Verifique se o método HTTP utilizado é permitido para este endpoint e corrija a requisição.",
      });
    });
  });
});
