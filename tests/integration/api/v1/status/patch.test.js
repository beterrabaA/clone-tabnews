import webserver from "@/infra/webserver";
import { waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("PATCH /status", () => {
  describe("Anonymous user", () => {
    test("Attempting to patch to status endpoint, should return 405", async () => {
      const body = await fetch(`${webserver.getOrigin}/api/v1/status`, {
        method: "PATCH",
      });

      expect(body.status).toBe(405);

      const json = await body.json();

      expect(json).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        status_code: 405,
        action:
          "Verifique se o método HTTP utilizado é permitido para este endpoint e corrija a requisição.",
      });
    });
  });
});
