import retry from "async-retry";
import webserver from "@/infra/webserver";
import database from "@/infra/database";
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

export async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

export async function runPendingMigrations() {
  await migrator.runMigrations();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};

export default orchestrator;
