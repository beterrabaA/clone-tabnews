import retry from "async-retry";
import webserver from "@/infra/webserver";

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

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
