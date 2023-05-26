import { MicroNatsClient } from "../../src";

describe("connect", () => {
  it("should connect with default host and port", async () => {
    const client = new MicroNatsClient();

    let error: any;
    try {
      await client["connect"]();
    } catch (err) {
      error = err;
    }

    await client.dispose();
    expect(error.message).toBe("CONNECTION_REFUSED");
  });
});
