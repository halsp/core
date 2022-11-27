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

  it("should connect with default port", async () => {
    const startup = new MicroMqttStartup();
    await startup.listen();

    expect((startup as any)["client"]["opt"]).toEqual({
      port: 1883,
    });
  });

  it("should connect with servers", async () => {
    const startup = new MicroMqttStartup({
      servers: [
        {
          host: "localhost",
          port: 1884,
        },
      ],
    });
    await startup.listen();

    expect((startup as any)["client"]["opt"]).toEqual({
      servers: [
        {
          host: "localhost",
          port: 1884,
        },
      ],
    });
  });
});
