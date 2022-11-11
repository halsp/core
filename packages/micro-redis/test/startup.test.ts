import { MicroRedisStartup } from "../src";

describe("startup", () => {
  it("should connect redis", async () => {
    let connect = false;
    let disconnect = false;

    jest.mock("redis", () => {
      return {
        createClient: () => {
          return {
            connect: () => {
              connect = true;
            },
            subscribe: () => undefined,
            disconnect: () => {
              disconnect = true;
            },
            isOpen: true,
            isReady: true,
          };
        },
      };
    });

    const startup = new MicroRedisStartup();
    const { pub, sub } = await startup.listen();
    await startup.close();

    expect(!!sub).toBeTruthy();
    expect(!!pub).toBeTruthy();
    expect(connect).toBeTruthy();
    expect(disconnect).toBeTruthy();
  });
});
