import database from "@/infra/database.js";
import {
  ORCHESTRATOR_TIMEOUT_IN_MILLISECONDS,
  waitForAllServices,
  WEB_SERVICE_URL,
} from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
}, ORCHESTRATOR_TIMEOUT_IN_MILLISECONDS);

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch(`${WEB_SERVICE_URL}/api/v1/migrations`);
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
