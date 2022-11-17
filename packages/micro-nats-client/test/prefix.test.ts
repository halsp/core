import { MicroNatsClient } from "../src";

describe("prefix", () => {
  it("should subscribe and publish pattern with prefix", async () => {
    let publishPattern = "";
    let subscribePattern = "";
    const client = new MicroNatsClient({
      prefix: "pt_",
    });

    let subscribeOpts: any;

    (client as any).connection = {
      isClosed: () => false,
      subscribe: (pattern: string, opts) => {
        subscribePattern = pattern;
        subscribeOpts = opts;
        return {
          unsubscribe: () => undefined,
        };
      },
      publish: (pattern) => {
        publishPattern = pattern;
      },
      unsubscribe: () => undefined,
    };

    await new Promise<void>(async (resolve) => {
      setTimeout(() => {
        subscribeOpts.callback(undefined, {
          data: Uint8Array.from(Buffer.from("{}")),
        });
      }, 500);
      await client.send("test_pattern", "", undefined, 1000);
      resolve();
    });
    expect(publishPattern).toBe("pt_test_pattern");
    expect(subscribePattern.startsWith("pt_test_pattern.")).toBeTruthy();
  });
});
