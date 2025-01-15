import test from "node:test";
import assert from "node:assert";

test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  assert.equal(response.status, 200);
});
