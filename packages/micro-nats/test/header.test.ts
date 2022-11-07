import { runSendTest } from "./utils";

describe("headers", () => {
  it("should set and get header", async () => {
    const result = await runSendTest(true, (ctx) => {
      ctx.res.headers.set("a", "1");
      ctx.res.headers.set("b", "2");
    });

    console.log("result", result.headers.set);
    expect(result.headers.get("a")).toBe("1");
    expect(result.headers.get("b")).toBe("2");
  });
});
