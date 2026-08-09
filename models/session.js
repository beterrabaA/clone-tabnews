import crypto from "crypto";
import database from "@/infra/database";
import errors from "@/infra/errors";

const { UnauthorizedError } = errors;

const EXPIRATION_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 Days

async function findOneValidByToken(token) {
  const sessionData = await runValidTokenQuery(token);
  if (!sessionData) {
    throw new UnauthorizedError({
      message: "Sessão inválida ou expirada.",
      action:
        "Verifique se a sessão é válida e tente novamente. Caso o problema persista, entre em contato com o suporte.",
    });
  }
  return sessionData;
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;
}

async function renew(sessionId) {
  const updatedSession = await runUpdateQuery(sessionId);

  return updatedSession;
}

async function runInsertQuery(token, userId, expiresAt) {
  const { rows } = await database.query({
    text: `
    INSERT INTO 
     sessions (token, user_id, expires_at) 
    VALUES 
     ($1, $2, $3) 
    RETURNING 
     id, token,user_id as "userId", expires_at AS "expiresAt",created_at AS "createdAt", updated_at AS "updatedAt";
     `,
    values: [token, userId, expiresAt],
  });
  return rows[0];
}

async function runUpdateQuery(sessionId) {
  const newExpiresAt = new Date(Date.now() + EXPIRATION_MILLISECONDS);

  const { rows } = await database.query({
    text: `
    UPDATE 
      sessions 
    SET 
      expires_at = $1, updated_at = NOW()
    WHERE 
      id = $2
    RETURNING 
      id, token,user_id as "userId", expires_at AS "expiresAt",created_at AS "createdAt", updated_at AS "updatedAt";
    `,
    values: [newExpiresAt, sessionId],
  });
  return rows[0];
}

async function runValidTokenQuery(token) {
  const { rows } = await database.query({
    text: `
    SELECT 
      id,user_id as "userId", expires_at AS "expiresAt", created_at AS "createdAt", updated_at AS "updatedAt" 
    FROM 
      sessions 
    WHERE 
      token = $1 
    AND 
      expires_at > NOW()
    LIMIT 
      1
    ;
    `,
    values: [token],
  });
  return rows[0];
}

const session = {
  create,
  findOneValidByToken,
  EXPIRATION_MILLISECONDS,
  renew,
};

export default session;
