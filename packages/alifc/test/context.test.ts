import { Response } from "@halsp/core";
import { AlifcStartup } from "../src";

const req: any = {
  queries: {},
  path: "/",
  method: "get",
  url: "",
  clientIP: "",
  headers: {},
};
const res: any = new Response();
res.send = () => undefined;

test("context", async () => {
  await new AlifcStartup()
    .use((ctx) => {
      const ctxAliReq = ctx.aliReq;
      const ctxAliRes = ctx.aliRes;
      const reqAliReq = ctx.req.aliReq;
      const resAliRes = ctx.res.aliRes;
      const reqStream = ctx.reqStream;

      expect(ctx.aliContext).toBe({
        c: 3,
      });
      expect(ctxAliReq).toBe(reqAliReq);
      expect(ctxAliReq).toEqual(req);
      expect(ctxAliRes).toBe(resAliRes);
      expect(ctxAliRes).toEqual(res);
      expect(reqStream).toBe(ctxAliReq);
    })
    .run(req, res, {
      c: 3,
    });
});
