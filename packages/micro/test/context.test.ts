import { MicroRequest, MicroResponse } from "../src";
import { TestStartup } from "./utils";

beforeAll(() => {
  new TestStartup();
});

describe("context", () => {
  it("should set req.id", () => {
    expect(new MicroRequest().id).toBe("");
    expect(new MicroRequest().setId("abc").id).toBe("abc");
    expect(new MicroRequest().setId(undefined as any).id).toBeUndefined();
  });

  it("should set req.error", () => {
    expect(new MicroResponse().error).toBeUndefined();
    expect(new MicroResponse().setError("err").error).toBe("err");
    expect(
      new MicroResponse().setError(undefined as any).error
    ).toBeUndefined();
  });
});

describe("parse pattern", () => {
  it("should parse pattern from path", async () => {
    await new TestStartup(new MicroRequest().setPattern("{a:1}"))
      .use((ctx) => {
        expect(ctx.req.pattern).toEqual({
          a: 1,
        });
      })
      .run();
  });
});
