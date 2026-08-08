import database from "@/infra/database";
import errors from "@/infra/errors";
import password from "@/models/password";

const { ValidationError, NotFoundError, ConflictError } = errors;

async function create(username, email, password) {
  if (!username || !email || !password) {
    throw new ValidationError({
      message: "Campos `username`, `email` e `password` são obrigatórios.",
      action: "Verifique os dados enviados e tente novamente.",
    });
  }

  await validateUniqueUsername(username);
  await validateUniqueEmail(email);

  const hashedPassword = await hashPasswordInObject(password);

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

async function findOneById(id) {
  const userData = await runSelectQueryById(id);

  if (!userData) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o ID do usuário e tente novamente.",
    });
  }

  return userData;
}

async function update(username, payload) {
  const existingUser = await findOneByUsername(username);

  if (Object.keys(payload).length === 0) {
    throw new ValidationError({
      message: "Nenhum campo para atualizar foi fornecido.",
      action: "Forneça o campo `username` ou `email` para atualizar.",
    });
  }
  if (
    !("username" in payload) &&
    !("email" in payload) &&
    !("password" in payload)
  ) {
    throw new ValidationError({
      message:
        "Os campo podem ser apenas `username`, `email` ou `password` para atualização.",
      action: "Corrija o campo do payload e tente novamente.",
    });
  }

  if ("username" in payload) {
    await validateUniqueUsername(payload.username);
  }
  if ("email" in payload) {
    await validateUniqueEmail(payload.email);
  }
  if ("password" in payload) {
    payload.password = await hashPasswordInObject(payload.password);
  }

  const newValues = { ...existingUser, ...payload };

  const updatedUser = await runUpdateQuery(existingUser.id, newValues);

  return updatedUser;
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
      id, username, email, password
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

async function runSelectQueryById(id) {
  const { rows } = await database.query({
    text: `
    SELECT 
      id, username, email, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM 
      users 
    WHERE 
      id = $1 
    LIMIT 
      1;`,
    values: [id],
  });

  return rows[0];
}

async function runUpdateQuery(id, payload) {
  // const values = Object.values(payload); // can't be used because the order of the keys in the object is not guaranteed.

  const { rows } = await database.query({
    text: `
    UPDATE 
      users
     SET 
      username = LOWER($2), email = $3,password = $4, updated_at = NOW() 
     WHERE 
      id = $1 
     RETURNING 
      username, email, updated_at AS "updatedAt", created_at AS "createdAt";`,
    values: [id, payload.username, payload.email, payload.password],
    // values: [username,...values]
  });

  return rows[0];
}

function validateFormatEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

async function validateUniqueEmail(email) {
  if (!validateFormatEmail(email)) {
    throw new ValidationError({
      message: "Formato de email inválido.",
      action: "Verifique o formato do email e tente novamente.",
    });
  }

  const { rows } = await database.query({
    text: `SELECT id FROM users WHERE LOWER(email) = LOWER($1);`,
    values: [email],
  });

  const existingUserByEmail = rows[0];

  if (existingUserByEmail)
    throw new ConflictError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email ou recupere a senha caso tenha esquecido.",
    });
}

async function validateUniqueUsername(username) {
  if (typeof username !== "string") {
    throw new ValidationError({
      message: "O campo 'username' deve ser do tipo string.",
      action: "Corrija o campo 'username' e tente novamente.",
    });
  }
  if (username.length < 3) {
    throw new ValidationError({
      message: "O campo 'username' deve conter pelo menos 3 caracteres.",
      action: "Corrija o campo 'username' e tente novamente.",
    });
  }
  if (username.length > 30) {
    throw new ValidationError({
      message: "O campo 'username' deve conter no máximo 30 caracteres.",
      action: "Corrija o campo 'username' e tente novamente.",
    });
  }

  const { rows } = await database.query({
    text: `SELECT id FROM users WHERE LOWER(username) = LOWER($1);`,
    values: [username],
  });

  const currentUser = rows[0];

  if (currentUser) {
    throw new ConflictError({
      message: "O nome de usuário informado já está sendo utilizado.",
      action: "Escolha outro nome de usuário e tente novamente.",
    });
  }
}

async function hashPasswordInObject(payload) {
  if (payload.length < 6) {
    throw new ValidationError({
      message: "Senha deve conter pelo menos 6 caracteres.",
      action: "Verifique a senha e tente novamente.",
    });
  }

  const hashedPassword = await password.hash(payload);
  return hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  findOneById,
  update,
  hashPasswordInObject,
};

export default user;
