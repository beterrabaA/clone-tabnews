import webserver from "@/infra/webserver";
import { clearDatabase, waitForAllServices } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("When there are pending migrations", () => {
      test("For the first time, should return 201", async () => {
        const response = await fetch(
          `${webserver.getOrigin}/api/v1/migrations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          },
        );
        expect(response.status).toBe(201);

        const response1Body = await response.json();
        expect(Array.isArray(response1Body)).toBe(true);
        expect(response1Body.length).toBeGreaterThan(0);
      });
      test("For the second time, should return 200", async () => {
        const response = await fetch(
          `${webserver.getOrigin}/api/v1/migrations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          },
        );
        expect(response.status).toBe(200);

        const response2Body = await response.json();
        expect(Array.isArray(response2Body)).toBe(true);
        expect(response2Body.length).toBe(0);
      });
    });
  });
});
