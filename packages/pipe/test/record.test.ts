import { HookType, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import { getPipeRecords } from "../src";
import { expectBody, getTestRequest, TestMiddleware } from "./TestMiddleware";

test("record test", async () => {
  let done = false;
  const startup = new Startup()
    .useHttp()
    .setContext(getTestRequest())
    .useInject();
  startup.hook(HookType.BeforeInvoke, (ctx, md) => {
    const fn = (cls: any, empty: boolean) => {
      const metadata = getPipeRecords(cls);
      expect(Array.isArray(metadata)).toBeTruthy();
      expect(metadata.length > 0).toBe(!empty);
    };

    // fn(md, true);
    fn(md.constructor, false);
    fn(md.constructor.prototype, false);
    done = true;
  });
  startup.add(TestMiddleware);

  const res = await startup.test();
  expect(done).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expectBody);
});
