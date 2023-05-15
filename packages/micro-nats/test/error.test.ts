import { Startup } from "@halsp/core";
import "../src";

describe("error", () => {
  it("should log error when subscript callback err is defined", async () => {
    let subscribePattern = "";
    let subscribeCallback: any;
    const startup = new Startup().useMicroNats({
      port: 6001,
    });
    const connection = await startup.listen();

    const subscribe = connection.subscribe;
    connection.subscribe = (pattern: string, opts: any) => {
      subscribePattern = pattern;
      subscribeCallback = opts.callback;
      return subscribe.bind(connection)(pattern, opts);
    };

    startup.register("test_pattern", () => undefined);

    let error: any;
    const beforeError = console.error;
    console.error = (err) => {
      error = err;
    };
    await subscribeCallback(new Error("err"));
    console.error = beforeError;

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    expect(subscribePattern).toBe("test_pattern");
    expect(error.message).toBe("err");
  });
});
