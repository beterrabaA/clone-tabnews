import retry from "async-retry";
import { faker } from "@faker-js/faker";

import webserver from "@/infra/webserver";
import database from "@/infra/database";
import migrator from "@/models/migrator";
import user from "@/models/user";
import session from "@/models/session";

export async function waitForAllServices() {
  await waitForWebService();

  async function waitForWebService() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver.getOrigin}/api/v1/status`);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

export async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

export async function runPendingMigrations() {
  await migrator.runMigrations();
}

export async function createUser(userObject) {
  return await user.create(
    userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    userObject?.email || faker.internet.email(),
    userObject?.password || "validpassword",
  );
}

export async function createSession(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};

export default orchestrator;
