import { MicroNatsClient } from "../src";
import { JSONCodec } from "@ipare/testing/dist/micro-nats";

describe("connect", () => {
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

  it("should connect with default host and port", async () => {
    const client = new MicroNatsClient();
    await client["connect"]();

    expect((client as any)["connection"]["opt"]).toEqual({
      port: 4222,
    });
  });
});
