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

  // it("should be error when the message is invalidate", async () => {
  //   let pattern: any = undefined;
  //   let data: any = undefined;
  //   const startup = new MicroRedisStartup()
  //     .use(async (ctx) => {
  //       pattern = ctx.req.pattern;
  //       data = ctx.req.body;
  //       expect(ctx.bag("pt")).toBeTruthy();
  //     })
  //     .patterns({
  //       pattern: "test_invalidate",
  //       handler: (ctx) => {
  //         ctx.bag("pt", true);
  //       },
  //     });
  //   const { pub } = await startup.listen();

  //   await pub?.publish("test_invalidate", `3#{}`);

  //   let times = 0;
  //   while (times < 20 && !pattern) {
  //     await new Promise<void>((resolve) => {
  //       setTimeout(() => resolve(), 100);
  //     });
  //     times++;
  //   }

  //   await startup.close();
  //   expect(pattern).toBeUndefined();
  //   expect(data).toBeUndefined();
  // });
});
