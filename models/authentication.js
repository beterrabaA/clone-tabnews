import database from "@/infra/database";
import errors from "@/infra/errors";
import password from "@/models/password";

const { UnauthorizedError, ValidationError } = errors;

async function getUser(payload) {
  validateSessionPayload(payload);

  const currentUser = await findOneByEmail(payload.email);
  await validateSessionPassword(payload.password, currentUser?.password);

  return { id: currentUser.id };
}

async function findOneByEmail(email) {
  const userData = await runSelectQueryByEmail(email);

  // if (!userData) {
  //   throw new NotFoundError({
  //     message: "Usuário não encontrado.",
  //     action: "Verifique o nome de usuário e tente novamente.",
  //   });
  // }

  return userData;
}

async function runSelectQueryByEmail(email) {
  const { rows } = await database.query({
    text: `
    SELECT 
      id, username, email, password
    FROM 
      users 
    WHERE 
      LOWER(email) = LOWER($1) 
    LIMIT 
      1;`,
    values: [email],
  });

  return rows[0];
}

function validateSessionPayload(payload) {
  const sessionSke = { email: "", password: "" };
  if (Object.keys(payload).length === 0) {
    throw new ValidationError({
      message: "Campos obrigatórios não fornecidos.",
      action: "Forneça o email e a senha para criar uma sessão.",
    });
  }
  if (!payload.email || !payload.password) {
    throw new ValidationError({
      message: "Campos `username`, `email` e `password` são obrigatórios.",
      action: "Verifique os dados enviados e tente novamente.",
    });
  }
  Object.keys(payload).map((key) => {
    if (Object.hasOwn(sessionSke, key)) return;
    throw new ValidationError({
      message:
        "Os campo podem ser apenas `email` e `password` para criação de sessão.",
      action: "Corrija o campo do payload e tente novamente.",
    });
  });
  if (!validateFormatEmail(payload.email)) {
    throw new ValidationError({
      message: "Formato de email inválido.",
      action: "Verifique o formato do email e tente novamente.",
    });
  }
}

function validateFormatEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

async function validateSessionPassword(payloadPassword, currentPassword) {
  const isPasswordValid = await password.compare(
    payloadPassword,
    currentPassword || "mB7@zN4q",
  );

  if (!isPasswordValid)
    throw new UnauthorizedError({
      message: "Credenciais inválidas.",
      action: "Verifique se o email e senha estão corretos e tente novamente.",
    });
}

const authenticaion = {
  getUser,
};

export default authenticaion;
