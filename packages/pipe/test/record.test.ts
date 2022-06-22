import { HookType, TestStartup } from "@sfajs/core";
import { PIPE_RECORDS_METADATA } from "../src";
import { expectBody, getTestRequest, TestMiddleware } from "./TestMiddleware";

test("record test", async () => {
  let done = false;
  const startup = new TestStartup(getTestRequest()).useInject();
  startup.hook(HookType.BeforeInvoke, (ctx, md) => {
    const metadata = Reflect.getMetadata(
      PIPE_RECORDS_METADATA,
      md.constructor.prototype
    );
    expect(metadata).not.toBeUndefined();
    expect(Array.isArray(metadata)).toBeTruthy();
    expect(metadata.length > 0).toBeTruthy();
    done = true;
  });
  startup.add(TestMiddleware);

  const res = await startup.run();
  expect(done).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expectBody);
});
