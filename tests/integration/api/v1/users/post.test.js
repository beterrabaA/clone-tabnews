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
      const data = await response.json();

      expect(response.status).toBe(201);

      expect(data).toHaveProperty("id");
      expect(data.id).toMatch(uuidRegex);
      expect(uuidVersion(data.id)).toBe(7);
      expect(data).toHaveProperty("username", fakeUserData.username);
      expect(data).toHaveProperty("email", fakeUserData.email);
      expect(data.password).toBeUndefined();
      expect(data).toHaveProperty("createdAt");
      expect(data).toHaveProperty("updatedAt");

      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
    });
    test("With invalid email format, should return 400", async () => {
      const invalidEmailUserData = {
        username: "invalidemailuser",
        email: "invalid-email-format",
        password: "password123",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidEmailUserData),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        name: "ValidationError",
        message: "Formato de email inválido.",
        status_code: 400,
        action: "Verifique o formato do email e tente novamente.",
      });
    });
    test("With short password, should return 400", async () => {
      const shortPasswordUserData = {
        username: "shortpassworduser",
        email: "shortpassworduser@example.com",
        password: "pass",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shortPasswordUserData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        name: "ValidationError",
        message: "Senha deve conter pelo menos 6 caracteres.",
        status_code: 400,
        action: "Verifique a senha e tente novamente.",
      });
    });
    test("With duplicate username, should return 409", async () => {
      const duplicateUsernameUserData = {
        username: "beterraba", // Same username as the first test
        email: "duplicateusername@example.com",
        password: "password123",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateUsernameUserData),
      });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        name: "ConflictError",
        message: "O nome de usuário informado já está sendo utilizado.",
        status_code: 409,
        action: "Escolha outro nome de usuário e tente novamente.",
      });
    });
    test("With duplicate email, should return 409", async () => {
      const duplicateEmailUserData = {
        username: "anotheruser",
        email: "beterraba@example.com",
        password: "password123",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateEmailUserData),
      });

      expect(response.status).toBe(409);

      const data = await response.json();

      expect(data).toEqual({
        name: "ConflictError",
        message: "O email informado já está sendo utilizado.",
        status_code: 409,
        action: "Utilize outro email ou recupere a senha caso tenha esquecido.",
      });
    });
    test("With missing required fields, should return 400", async () => {
      const incompleteUserData = {
        username: "incompleteuser",
        // email is missing
        password: "password123",
      };

      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incompleteUserData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        name: "ValidationError",
        message: "Campos `username`, `email` e `password` são obrigatórios.",
        status_code: 400,
        action: "Verifique os dados enviados e tente novamente.",
      });
    });
    test("With empty request body, should return 400", async () => {
      const response = await fetch(`${webserver.getOrigin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        name: "ValidationError",
        message: "Campos `username`, `email` e `password` são obrigatórios.",
        status_code: 400,
        action: "Verifique os dados enviados e tente novamente.",
      });
    });
  });
});
