import { JSONCodec } from "@ipare/testing/dist/micro-nats";
import { MicroNatsStartup } from "../src";

describe("startup", () => {
  it("should connect nats", async () => {
    let connect = false;
    let disconnect = false;

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
});
