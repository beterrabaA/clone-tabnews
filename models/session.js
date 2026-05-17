import crypto from "crypto";
import database from "@/infra/database";

const EXPIRATION_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 Days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;
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

const session = {
  create,
};

export default session;
