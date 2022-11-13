import {
  createMock,
  mockPkgName,
  TestMicroMqttClient,
  TestMicroMqttStartup,
} from "../src/micro-mqtt";

describe("micro-mqtt", () => {
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish", async () => {
    const startup = new TestMicroMqttStartup().pattern(
      "test_pattern",
      (ctx) => {
        ctx.res.body = ctx.req.body;
      }
    );
    await startup.listen();

    const client = new TestMicroMqttClient();
    await client.connect();

    const result = await client.send("test_pattern", "test_body");
    expect(result.data).toBe("test_body");

    await client.dispose();
    await startup.close();
  });

  it("should create new mock client", async () => {
    const client1 = createMock();
    expect(client1.connect()).toBe(client1.connect());

    const client2 = createMock(false);
    expect(client2.connect()).not.toBe(client2.connect());
  });

  it("should be timeout without pattern", async () => {
    const opt = {
      test_equal: true,
    };
    const startup = new TestMicroMqttStartup();
    await startup.listen();

    const client = new TestMicroMqttClient({
      publishOptions: opt as any,
    });
    await client.connect();

    const result = await client.send("test_pattern_equal", "test_body", 1000);
    expect(result.error).toBe("Send timeout");

    await client.dispose();
    await startup.close();
  });

  it("should not mock packate when IS_LOCAL_TEST is true", () => {
    process.env.IS_LOCAL_TEST = "true";
    expect(mockPkgName).toBe("jest");
    process.env.IS_LOCAL_TEST = "";
  });

  it("should mock packate when IS_LOCAL_TEST is undefined", () => {
    process.env.IS_LOCAL_TEST = "";
    expect(mockPkgName).toBe("mqtt");
  });
});
