import { Request } from "@ipare/core";
import { MicroException } from "../src";
import { TestStartup } from "./utils";

describe("startup", () => {
  it("should set env", () => {
    process.env.IS_IPARE_MICRO = "" as any;
    new TestStartup();
    expect(process.env.IS_IPARE_MICRO).toBe("true");
  });

  it("should invoke middlewares", async () => {
    const res = await new TestStartup(new Request().setId("abc"))
      .use(async (ctx, next) => {
        ctx.res.setBody({
          id: ctx.req.id,
        });
        await next();
      })
      .use((ctx) => {
        ctx.res.setStatus("ok");
      })
      .run();
    expect(res.body).toEqual({
      id: "abc",
    });
    expect(res.status).toBe("ok");
  });

  it("should set error if throw MicroException", async () => {
    const res = await new TestStartup()
      .use(() => {
        throw new MicroException("err");
      })
      .run();

    expect(res.status).toBe("error");
    expect(res.error).toBe("err");
    expect(res.body).toBeUndefined();
  });
});
