import test from "node:test";
import assert, { equal } from "node:assert";

test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  equal(response.status, 200);

  const { updated_at, dependecies } = await response.json();

  const parsedUpdatedAt = new Date(updated_at).toISOString();
  equal(updated_at, parsedUpdatedAt);

  equal(dependecies.database.version, "17.2");
  equal(dependecies.database.max_connections, 100);
  equal(dependecies.database.opened_connections, 1);
});
