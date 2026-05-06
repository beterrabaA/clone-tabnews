describe("GET /api/v1/hello", () => {
  test("should return 200 and the correct message", async () => {
    const response = await fetch("http://localhost:3000/api/v1/hello");
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Hello, World!");
  });
});
