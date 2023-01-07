import { MicroNatsClient } from "../src";

describe("connect", () => {
  it("should connect with default host and port", async () => {
    const client = new MicroNatsClient();
    await client["connect"]();

    const info = client["connection"]?.info;
    await client.dispose();

    expect(info?.port).toBe(4222);
    expect(info?.host).toBe("0.0.0.0");
  });
});
