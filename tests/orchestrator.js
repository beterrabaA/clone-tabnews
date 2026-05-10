import retry from "async-retry";
import webserver from "@/infra/webserver";
import database from "@/infra/database";
import { execSync } from "child_process";
import migrator from "@/models/migrator";

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

export function stopDatabase() {
  execSync("npm run services:stop");
}

export function startDatabase() {
  execSync("npm run services:up");
}

export async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

export async function runPendingMigrations() {
  await migrator.runMigrations();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  stopDatabase,
  startDatabase,
  runPendingMigrations,
};

export default orchestrator;
