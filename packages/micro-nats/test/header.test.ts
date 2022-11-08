import { runSendTest } from "./utils";
import * as nats from "nats";

describe("headers", () => {
  it("should set and get header", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.headers.set("a", "1");
      },
      undefined,
      undefined,
      undefined,
      true
    );

    expect(result.headers.get("a")).toBe("1");
  });

  it("should send message with header", async () => {
    const headers = nats.headers();
    headers.set("a", "1");
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.headers.set("a", ctx.req.headers.get("a"));
      },
      undefined,
      undefined,
      headers,
      true
    );

    expect(result.headers.get("a")).toBe("1");
  });
});
