import webserver from "@/infra/webserver";
import {
  clearDatabase,
  runPendingMigrations,
  waitForAllServices,
} from "@/tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data, should return 201", async () => {
      const fakeUserData = {
        username: "beterraba",
        email: "beterraba@example.com",
        password: "securepassword",
      };
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fakeUserData),
      });
      const responseData = await response.json();

      expect(response.status).toBe(201);

      expect(responseData).toHaveProperty("id");
      expect(responseData.id).toMatch(uuidRegex);
      expect(uuidVersion(responseData.id)).toBe(7);
      expect(responseData).toHaveProperty("username", fakeUserData.username);
      expect(responseData).toHaveProperty("email", fakeUserData.email);
      expect(responseData).toHaveProperty("createdAt");
      expect(responseData).toHaveProperty("updatedAt");

      expect(new Date(responseData.createdAt).toString()).not.toBe(
        "Invalid Date",
      );
      expect(new Date(responseData.updatedAt).toString()).not.toBe(
        "Invalid Date",
      );
    });
  });
});
