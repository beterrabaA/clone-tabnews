import webserver from "@/infra/webserver";
import { createUserAction } from "@/lib/actions";
import {
  clearDatabase,
  runPendingMigrations,
  waitForAllServices,
} from "@/tests/orchestrator";
import { parseCookies } from "@/utils/cookie";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("1 - Attempting to create session with valid credentials (should return 201)", async () => {
      const fakerUserData = {
        username: "validusername",
        email: "emailvalidusername@email.com",
      };
      // Arrange: Criar um usuário de teste no banco de dados
      const fakeData = await createUserAction(fakerUserData);
      // Act: Fazer fetch (POST) enviando email e senha do usuário
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fakerUserData.email,
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 201 e se a resposta contém os dados da sessão (token, id, etc.)
      expect(response.status).toBe(201);

      const data = await response.json();

      expect(data).toEqual({
        id: data.id,
        token: data.token,
        expiresAt: data.expiresAt,
        userId: fakeData.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });

      expect(uuidVersion(data.id)).toBe(7);
      expect(new Date(data.expiresAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
    });
    test("2 - Attempting to create session with invalid password (should return 401)", async () => {
      const fakerUserData = {
        username: "username123",
        email: "emailusername123@email.com",
        password: "password",
      };
      // Arrange: Ter um usuário de teste
      await createUserAction(fakerUserData);
      // Act: Fazer fetch (POST) enviando o email correto e uma senha incorreta
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fakerUserData.email,
          password: "wrongpassword",
        }),
      });
      // Assert: Verificar se o status é 401 (Unauthorized) e se a mensagem de erro está correta
      expect(response.status).toBe(401);

      const data = await response.json();

      expect(data).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais inválidas.",
        status_code: 401,
        action:
          "Verifique se o email e senha estão corretos e tente novamente.",
      });
    });
    test("3 - Attempting to create session with invalid email (should return 401)", async () => {
      await createUserAction({
        username: "username12",
      });
      // Act: Fazer fetch (POST) enviando o email correto e uma senha incorreta
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "non-existing@email.com",
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 401 (Unauthorized) e se a mensagem de erro está correta
      expect(response.status).toBe(401);

      const data = await response.json();

      expect(data).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais inválidas.",
        status_code: 401,
        action:
          "Verifique se o email e senha estão corretos e tente novamente.",
      });
    });
    test("4 - Attemption to create session with invalid payload (should return 400)", async () => {
      //
      const fakerUserData = {
        username: "username1asdas23",
        email: "emaildadad@email.com",
        password: "password",
      };
      await createUserAction(fakerUserData);
      // Act:
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fakerUserData.email,
          password: fakerUserData.password,
          invalidField: "invalidValue",
        }),
      });
      // Assert:
      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message:
          "Os campo podem ser apenas `email` e `password` para criação de sessão.",
        status_code: 400,
        action: "Corrija o campo do payload e tente novamente.",
      });
    });
    test("5 - Attempting to create session with non-existent email (should return 401)", async () => {
      // Act: Fazer fetch (POST) enviando um email que não existe no banco
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "non-existing@email.com",
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 401 e a mensagem de erro
      expect(response.status).toBe(401);

      const data = await response.json();

      expect(data).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais inválidas.",
        status_code: 401,
        action:
          "Verifique se o email e senha estão corretos e tente novamente.",
      });
    });

    test("6 - Attempting to create session with missing fields (should return 400)", async () => {
      // Act: Fazer fetch sem mandar email ou password
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      // Assert: Verificar se o status é 400 (Bad Request) indicando falha de validação (ValidationError)

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "Campos obrigatórios não fornecidos.",
        status_code: 400,
        action: "Forneça o email e a senha para criar uma sessão.",
      });
    });

    test("7 - Attempting to create session with invalid email format (should return 400)", async () => {
      // Arrange: Ter um payload com email fora de formato ("emailinvalido.com")
      await createUserAction({
        username: "usernameasdasd123",
        email: "emailinvalido.com",
      });
      // Act: Fazer fetch (POST) enviando esse payload
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailinvalido.com",
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 400 apontando erro na validação do campo email
      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data).toEqual({
        name: "ValidationError",
        message: "Formato de email inválido.",
        status_code: 400,
        action: "Verifique o formato do email e tente novamente.",
      });
    });
    test("8 - Attempting to create session with valid credentials but different email casing (should return 201)", async () => {
      // Arrange: Criar um usuário de teste com email "teste@exemplo.com"
      const fakeData = await createUserAction({
        username: "username123dadq3",
        email: "teste@exemplo.com",
      });
      // Act: Fazer fetch (POST) enviando o email misturando maiúsculas/minúsculas "TeStE@eXemPlo.cOm"
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "TeStE@eXemPlo.cOm",
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 201 e a sessão foi criada corretamente (Case Insensitive)
      expect(response.status).toBe(201);

      const data = await response.json();

      expect(data).toEqual({
        id: data.id,
        token: data.token,
        expiresAt: data.expiresAt,
        userId: fakeData.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });

      expect(uuidVersion(data.id)).toBe(7);
      expect(new Date(data.expiresAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.createdAt).toString()).not.toBe("Invalid Date");
      expect(new Date(data.updatedAt).toString()).not.toBe("Invalid Date");
    });
    test("9 - Attempting to create session with valid credentials and valided session cookie body", async () => {
      const fakerUserData = {
        username: "validussername",
        email: "emailvaliduassername@email.com",
      };
      // Arrange: Criar um usuário de teste no banco de dados
      await createUserAction(fakerUserData);
      // Act: Fazer fetch (POST) enviando email e senha do usuário
      const response = await fetch(`${webserver.getOrigin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fakerUserData.email,
          password: "password",
        }),
      });
      // Assert: Verificar se o status é 201 e se a resposta contém os dados da sessão (token, id, etc.)
      expect(response.status).toBe(201);
      const cookieString = response.headers.getSetCookie();
      const emyCookie = parseCookies(cookieString);

      const data = await response.json();

      expect(emyCookie).toEqual({
        name: emyCookie.name,
        value: data.token,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(data.expiresAt).toUTCString(),
        domain: webserver.getOrigin,
      });
    });
  });
});
