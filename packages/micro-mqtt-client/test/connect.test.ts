import { MicroMqttClient } from "../src";

describe("connect", () => {
  jest.mock("mqtt", () => {
    return {
      connect: (opt: any) => {
        return {
          opt,
          on: (event: string, cb: any) => {
            if (event == "connect") {
              setTimeout(() => cb(), 500);
            }
          },
        };
      },
    };
  });

  it("should create url for mqtt package", async () => {
    const client = new MicroMqttClient({
      host: "127.0.0.1",
      port: 1000,
    });
    await client.connect();

    expect((client as any)["client"]["opt"]).toEqual({
      port: 1000,
      services: "127.0.0.1",
    });
  });

  it("should connect with default host and port", async () => {
    const client = new MicroMqttClient();
    await client.connect();

    expect((client as any)["client"]["opt"]).toEqual({
      port: 1883,
      services: "localhost",
    });
  });
});
