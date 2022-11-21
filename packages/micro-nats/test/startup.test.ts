import { MicroNatsStartup } from "../src";

describe("startup", () => {
  it("should connect nats", async () => {
    let connect = false;
    let disconnect = false;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JSONCodec } = require("@ipare/testing/dist/micro-nats");
    jest.mock("nats", () => {
      return {
        connect: () => {
          connect = true;
          return {
            subscribe: () => undefined,
            close: () => {
              disconnect = true;
            },
            isClosed: () => false,
          };
        },
        JSONCodec: JSONCodec,
      };
    });

    const startup = new MicroNatsStartup();
    const conection = await startup.listen();
    await startup.close();

    expect(!!conection).toBeTruthy();
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
  });

  it("should listen with IPARE_DEBUG_PORT", async () => {
    process.env.IPARE_DEBUG_PORT = "42221";
    const startup = new MicroNatsStartup();
    const conection = await startup.listen();
    await startup.close();

    expect(!!conection).toBeTruthy();
  });
});
