import retry from "async-retry";

export const WEB_SERVICE_URL = "http://localhost:3000";
export const ORCHESTRATOR_TIMEOUT_IN_MILLISECONDS = 60_000;

export async function waitForAllServices() {
  await waitForWebService();

  async function waitForWebService() {
    return retry(fetchStatusPage, {
      retries: 100,
    });

    async function fetchStatusPage() {
      await fetch(`${WEB_SERVICE_URL}/api/v1/status`);
    }
  }
}
