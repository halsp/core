import { MicroNatsStartup } from "../src";
import { createMockNats, mockConnection } from "../src/mock";

describe("startup", () => {
  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroNatsStartup()
      .use(async (ctx) => {
        pattern = ctx.req.pattern;
        data = ctx.req.body;
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .patterns({
        pattern: "test_invalidate",
        handler: (ctx) => {
          ctx.bag("pt", true);
        },
      });
    mockConnection.bind(startup)();
    const connect = await startup.listen();

    const beforeError = console.error;
    let err = false;
    console.error = () => {
      err = true;
    };
    connect?.publish("test_invalidate", Buffer.from(`3#{}`, "utf-8"));

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    console.error = beforeError;

    await startup.close();
    expect(err).toBeTruthy();
    expect(pattern).toBeUndefined();
    expect(data).toBeUndefined();
  });
});

describe("respond", () => {
  it("should respond when reply is defined", async () => {
    const waitResult = await new Promise<boolean>((resolve) => {
      const mockConnection = createMockNats();
      mockConnection.connect();
      mockConnection.subscribe("test_respond", {
        callback: (err, msg) => {
          msg.respond(Buffer.from(`12#{"id":"abc"}`));
        },
      });
      mockConnection.subscribe("rep", {
        callback: () => {
          resolve(true);
        },
      });
      mockConnection.publish("test_respond", Buffer.from(`12#{"id":"abc"}`), {
        reply: "rep",
      });
      setTimeout(() => resolve(false), 1000);
    });
    expect(waitResult).toBeTruthy();
  });

  it("should not respond when reply is undefined", async () => {
    const waitResult = await new Promise<boolean>((resolve) => {
      const mockConnection = createMockNats();
      mockConnection.connect();
      mockConnection.subscribe("test_not_respond", {
        callback: (err, msg) => {
          msg.respond(Buffer.from(`12#{"id":"abc"}`));
        },
      });
      mockConnection.subscribe("rep", {
        callback: () => {
          resolve(false);
        },
      });
      mockConnection.publish(
        "test_not_respond",
        Buffer.from(`12#{"id":"abc"}`)
      );
      setTimeout(() => resolve(true), 1000);
    });
    expect(waitResult).toBeTruthy();
  });
});
