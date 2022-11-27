import { MicroNatsStartup } from "../src";

describe("connect", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { JSONCodec } = require("@ipare/testing/dist/micro-nats");
  jest.mock("nats", () => {
    return {
      connect: (opt: any) => {
        return {
          opt,
        };
      },
      JSONCodec: JSONCodec,
    };
  });

  it("should connect with default port", async () => {
    const startup = new MicroNatsStartup();
    await startup.listen();

    expect((startup as any)["connection"]["opt"]).toEqual({
      port: 4222,
    });
  });
});
