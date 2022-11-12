import {
  createMock,
  TestMicroRedisClient,
  TestMicroRedisStartup,
} from "../src/micro-redis";

describe("micro-redis", () => {
  jest.mock("redis", () => createMock(true));

  it("should subscribe and publish", async () => {
    const startup = new TestMicroRedisStartup().pattern(
      "test_pattern",
      (ctx) => {
        ctx.res.body = ctx.req.body;
      }
    );
    await startup.listen();

    const client = new TestMicroRedisClient();
    await client.connect();

    const result = await client.send("test_pattern", "test_body");
    expect(result.data).toBe("test_body");

    await client.dispose();
    await startup.close();
  });

  it("should create new mock client", async () => {
    const client1 = createMock();
    expect(client1.createClient()).toBe(client1.createClient());

    const client2 = createMock(false);
    expect(client2.createClient()).not.toBe(client2.createClient());
  });
});
