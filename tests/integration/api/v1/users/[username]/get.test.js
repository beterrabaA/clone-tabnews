import webserver from "@/infra/webserver";
import {
  clearDatabase,
  runPendingMigrations,
  waitForAllServices,
} from "@/tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("Create and retrieve a user,with exact case matching, should return 200", async () => {
      const userData = {
        username: "beterraba",
        email: "beterraba@example.com",
        password: "securepassword",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(
        `${webserver.getOrigin}/api/v1/users/${userData.username}`,
      );

      const data = await response2.json();
      expect(response2.status).toBe(200);
      expect(data.username).toBe(userData.username);
      expect(data.email).toBe(userData.email);
      expect(data.password).toBeUndefined();
    });
    test("With non-existing username, should return 404", async () => {
      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/nonexistinguser`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(response.status).toBe(404);

      const data = await response.json();

      expect(data).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        status_code: 404,
        action: "Verifique o nome de usuário e tente novamente.",
      });
    });
    test("With case-insensitive username, should return 200", async () => {
      const fakeUserData = {
        username: "CaseSensitiveUser",
        email: "casesensitiveuser@example.com",
        password: "securepassword",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fakeUserData),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(
        `${webserver.getOrigin}/api/v1/users/casesensitiveuser`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(response2.status).toBe(200);

      const data = await response2.json();

      expect(data.username).toBe(fakeUserData.username);
      expect(data.email).toBe(fakeUserData.email);
    });
  });
});
