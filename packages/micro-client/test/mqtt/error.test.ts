import { createMock } from "@ipare/testing/dist/micro-mqtt";
import { MicroMqttClient } from "../../src";

describe("error", () => {
  jest.mock("mqtt", () => createMock());

  it("should log error if client emit error event", async () => {
    const client = new MicroMqttClient();
    await client.connect();

    let error: any;
    client.logger = {
      error: (err: any) => {
        error = err;
      },
    } as any;

    client["client"]?.emit("error", new Error("err"));

    expect(error.message).toBe("err");
  });

  it("should ignore error if logger is undefined", async () => {
    const client = new MicroMqttClient();
    await client.connect();
    client.logger = undefined as any;

    client["client"]?.emit("error", new Error("err"));
  });
});
