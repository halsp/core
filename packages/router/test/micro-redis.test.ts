import {
  createMock,
  TestMicroRedisClient,
  TestMicroRedisStartup,
} from "@ipare/testing/dist/micro-redis";
import "./utils-micro";

describe("micro-nats", () => {
  jest.mock("redis", () => createMock());

  it("should add pattern handlers when use micro nats", async () => {
    const startup = new TestMicroRedisStartup().useTestRouter().useRouter();
    await startup.listen();

    const client = new TestMicroRedisClient();
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });
});
