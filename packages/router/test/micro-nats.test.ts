import {
  createMock,
  TestMicroNatsClient,
  TestMicroNatsStartup,
} from "@ipare/testing/dist/micro-nats";
import "./utils-micro";

describe("micro-nats", () => {
  jest.mock("nats", () => createMock(true));

  it("should add pattern handlers when use micro nats", async () => {
    const startup = new TestMicroNatsStartup().useTestRouter().useRouter();
    await startup.listen();

    const client = new TestMicroNatsClient();
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });
});
