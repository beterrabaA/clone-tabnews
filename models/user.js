import database from "@/infra/database";
import errors from "@/infra/errors";
import { hashSync } from "bcrypt";

const { ValidationError, NotFoundError } = errors;

async function create(username, email, password) {
  if (!username || !email || !password) {
    throw new ValidationError({
      message: "Campos `username`, `email` e `password` são obrigatórios.",
      action: "Verifique os dados enviados e tente novamente.",
    });
  }

  if (password.length < 6)
    throw new ValidationError({
      message: "Senha deve conter pelo menos 6 caracteres.",
      action: "Verifique a senha e tente novamente.",
    });

  if (!validateFormatEmail(email)) {
    throw new ValidationError({
      message: "Formato de email inválido.",
      action: "Verifique o formato do email e tente novamente.",
    });
  }

  const existingUserByEmail = await validateUniqueEmail(email);
  if (existingUserByEmail)
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email ou recupere a senha caso tenha esquecido.",
    });

  const existingUserByUsername = await validateUniqueUsername(username);
  if (existingUserByUsername)
    throw new ValidationError({
      message: "O nome de usuário informado já está sendo utilizado.",
      action: "Utilize outro nome de usuário.",
    });

  const hashedPassword = hashSync(password, 10); // TODO: hash password before storing in database

  const newUser = await runInsertQuery({
    username,
    email,
    password: hashedPassword,
  });

  return newUser;
}

async function findOneByUsername(username) {
  const userData = await runSelectQuery(username);

  if (!userData) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o nome de usuário e tente novamente.",
    });
  }

  return userData;
}

async function runInsertQuery({ username, email, password }) {
  const { rows } = await database.query({
    text: `
      INSERT INTO 
        users (username, email, password)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        id, username, email, created_at AS "createdAt", updated_at AS "updatedAt";
    `,
    values: [username, email, password],
  });

  return rows[0];
}

async function runSelectQuery(username) {
  const { rows } = await database.query({
    text: `
    SELECT 
      id, username, email 
    FROM 
      users 
    WHERE 
      LOWER(username) = LOWER($1) 
    LIMIT 
      1;`,
    values: [username],
  });

  return rows[0];
}

function validateFormatEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

async function validateUniqueEmail(email) {
  const { rows } = await database.query({
    text: `SELECT id FROM users WHERE LOWER(email) = LOWER($1);`,
    values: [email],
  });

  return rows[0];
}

async function validateUniqueUsername(username) {
  const { rows } = await database.query({
    text: `SELECT id FROM users WHERE LOWER(username) = LOWER($1);`,
    values: [username],
  });

  return rows[0];
}

const user = {
  create,
  findOneByUsername,
};

export default user;
