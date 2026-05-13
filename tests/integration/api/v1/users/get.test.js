import webserver from "@/infra/webserver";
import { waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
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
});
