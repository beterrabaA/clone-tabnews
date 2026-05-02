import webserver from "@/infra/webserver";
import { clearDatabase, waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations, should return 200", async () => {
      const response = await fetch(`${webserver.getOrigin}/api/v1/migrations`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
