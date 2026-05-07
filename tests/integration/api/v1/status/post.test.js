import webserver from "@/infra/webserver";
import { waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Attempting to post to status endpoint, should return 405", async () => {
      const responseBody = await fetch(`${webserver.getOrigin}/api/v1/status`, {
        method: "POST",
      });

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
