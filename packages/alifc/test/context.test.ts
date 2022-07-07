import { SfaResponse } from "@sfajs/core";
import { SfaAlifunc } from "../src";

const req: any = {
  queries: {},
  path: "/",
  method: "get",
  url: "",
  clientIP: "",
  headers: {},
};
const res: any = new SfaResponse();
res.send = () => undefined;

test("context", async () => {
  await new SfaAlifunc()
    .use((ctx) => {
      const context = ctx.aliContext;
      const aliReq1 = ctx.aliReq;
      const aliReq2 = ctx.req.aliReq;
      const aliRes1 = ctx.aliRes;
      const aliRes2 = ctx.res.aliRes;

      expect(context).toBe({
        c: 3,
      });
      expect(aliReq1).toBe(aliReq2);
      expect(aliReq1).toEqual(req);
      expect(aliRes1).toBe(aliRes2);
      expect(aliRes1).toEqual(res);
    })
    .run(req, res, {
      c: 3,
    });
});
