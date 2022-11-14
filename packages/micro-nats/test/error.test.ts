import { MicroNatsStartup } from "../src";
import { JSONCodec } from "@ipare/testing/dist/micro-nats";

describe("error", () => {
  jest.mock("nats", () => {
    return {
      connect: () => {
        return {
          connect: () => undefined,
          subscribe: () => undefined,
        };
      },
      headers: () => {
        return {};
      },
      JSONCodec: JSONCodec,
    };
  });

  it("should log error when subscript callback err is defined", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new MicroNatsStartup();
    await startup.listen();

    (startup as any).connection = {
      isClosed: () => false,
      subscribe: (pattern: string, opts) => {
        subscribePattern = pattern;
        subscribeCallback = opts.callback;
        return {
          unsubscribe: () => undefined,
        };
      },
    };

    startup.patterns({
      pattern: "test_pattern",
      handler: () => undefined,
    });

    let error: any;
    const beforeError = console.error;
    console.error = (err) => {
      error = err;
    };
    await subscribeCallback(new Error("err"));
    console.error = beforeError;

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(error.message).toBe("err");
  });
});
