import { MicroMqttStartup } from "../src";

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
    const startup = new MicroMqttStartup({
      host: "127.0.0.1",
      port: 1000,
    });
    await startup.listen();

    expect((startup as any)["client"]["opt"]).toEqual({
      services: "127.0.0.1",
      port: 1000,
    });
  });

  it("should connect with default host and port", async () => {
    const startup = new MicroMqttStartup();
    await startup.listen();

    expect((startup as any)["client"]["opt"]).toEqual({
      services: "localhost",
      port: 1883,
    });
  });
});
