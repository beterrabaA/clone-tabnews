import webserver from "@/infra/webserver";
import { createUserAction } from "@/lib/actions";
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

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("1 - Update non-existing user, should return 404", async () => {
      const fakeUserData = {
        username: "nonexistentuser",
      };

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fakeUserData),
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
    test("2 - with empty payload, should return 400", async () => {
      const fakeUserData = {
        username: "TesadaastUserForPatch",
      };

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "Nenhum campo para atualizar foi fornecido.",
        status_code: 400,
        action: "Forneça o campo `username` ou `email` para atualizar.",
      });
    });
    test("3 - with invalid payload, should return 400", async () => {
      const fakeUserData = {
        username: "TestUserzczForPatchInvalid",
      };

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skinColor: "not-an-email",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message:
          "Os campo podem ser apenas `username`, `email` ou `password` para atualização.",
        status_code: 400,
        action: "Corrija o campo do payload e tente novamente.",
      });
    });
    test("4 - with incorret data type, should return 400", async () => {
      const fakeUserData = {
        username: "TestUserForPatchInvalidType",
      };

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: 12345,
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "O campo 'username' deve ser do tipo string.",
        status_code: 400,
        action: "Corrija o campo 'username' e tente novamente.",
      });
    });
    test("5 - with valid payload,but conflicting username, should return 409", async () => {
      const usersData = [
        {
          username: "ExistingUserFo",
        },
        {
          username: "AnotherExisting",
        },
      ];

      await Promise.all(
        usersData.map(async (user) => {
          await createUserAction(user);
        }),
      );

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${usersData[0].username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usersData[1].username,
          }),
        },
      );

      expect(response.status).toBe(409);

      const data = await response.json();

      expect(data).toEqual({
        name: "ConflictError",
        message: "O nome de usuário informado já está sendo utilizado.",
        status_code: 409,
        action: "Escolha outro nome de usuário e tente novamente.",
      });
    });
    test("6 - with valid payload but username with more than 30 characters, should return 400", async () => {
      const fakeUserData = {
        username: "testuser",
      };

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "a".repeat(31),
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "O campo 'username' deve conter no máximo 30 caracteres.",
        status_code: 400,
        action: "Corrija o campo 'username' e tente novamente.",
      });
    });
    test("7 - with valid payload but username with empty string, should return 400", async () => {
      const fakeUserData = {
        username: "testuserempty",
      };

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "",
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "O campo 'username' deve conter pelo menos 3 caracteres.",
        status_code: 400,
        action: "Corrija o campo 'username' e tente novamente.",
      });
    });
    test("8 - with valid payload, should return 200", async () => {
      const fakeUserData = {
        username: "testuserforpatchazupdate",
        email: "email4asdsasda@email.com",
      };

      const newUsername = "newusername";

      await createUserAction(fakeUserData);

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toHaveProperty("username", newUsername.toLowerCase());
      expect(data).toHaveProperty("email", fakeUserData.email);
      expect(data.password).toBeUndefined();
      expect(data).toHaveProperty("createdAt");
      expect(data).toHaveProperty("updatedAt");

      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
      expect(data.updatedAt > data.createdAt).toBe(true);
    });
    test("9 - with valid payload and case-insensitive username, should return 200", async () => {
      const fakeUserData = {
        username: "eqoieawjdoiahds",
        email: "emaildadasadodiajda@email.com",
      };

      await createUserAction(fakeUserData);

      const newUsername = "EqOiEaWjDoIaDs";

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toHaveProperty("username", newUsername.toLowerCase());
      expect(data).toHaveProperty("email", fakeUserData.email);
      expect(data.password).toBeUndefined();
      expect(data).toHaveProperty("createdAt");
      expect(data).toHaveProperty("updatedAt");

      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
      expect(data.updatedAt > data.createdAt).toBe(true);
    });
    test("10 - with valid payload and case-insensitive email, should return 200", async () => {
      const fakeUserData = {
        username: "eqoieawjdoiahds",
      };

      await createUserAction(fakeUserData);

      const newEmail = "sadaweeqwe@email.com";

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newEmail,
          }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toHaveProperty("username", fakeUserData.username);
      expect(data).toHaveProperty("email", newEmail.toLowerCase());
      expect(data.password).toBeUndefined();
      expect(data).toHaveProperty("createdAt");
      expect(data).toHaveProperty("updatedAt");

      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
      expect(data.updatedAt > data.createdAt).toBe(true);
    });
    test("11 - with valid payload but using invalid email format, should return 400", async () => {
      const fakeUserData = {
        username: "aaxzc324eqwdas",
      };

      await createUserAction(fakeUserData);

      const invalidEmail = "invalid-email";

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: invalidEmail,
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "Formato de email inválido.",
        status_code: 400,
        action: "Verifique o formato do email e tente novamente.",
      });
    });
    test("12 - with valid payload, using password with less than 6 characters, should return 400", async () => {
      const fakeUserData = {
        username: "123qeua9dua08ad",
      };

      await createUserAction(fakeUserData);

      const invalidPassword = "12345";

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: invalidPassword,
          }),
        },
      );

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "Senha deve conter pelo menos 6 caracteres.",
        status_code: 400,
        action: "Verifique a senha e tente novamente.",
      });
    });
    test("13 - with valid payload, using password with more than 6 characters and less than 30 characters, should return 200", async () => {
      const fakeUserData = {
        username: "eqoieawjdoi45ahds",
        email: "emailda23sd33jda@email.com",
      };

      await createUserAction(fakeUserData);

      const validPassowrd = "sadaweeqwe@email.com";

      const response = await fetch(
        `${webserver.getOrigin}/api/v1/users/${fakeUserData.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: validPassowrd,
          }),
        },
      );

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data).toHaveProperty("username", fakeUserData.username);
      expect(data).toHaveProperty("email", fakeUserData.email);
      expect(data.password).toBeUndefined();
      expect(data).toHaveProperty("createdAt");
      expect(data).toHaveProperty("updatedAt");

      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
      expect(data.updatedAt > data.createdAt).toBe(true);
    });
  });
});
