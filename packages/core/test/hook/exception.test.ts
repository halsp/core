import {
  NotFoundException,
  TestStartup,
  getReasonPhrase,
  HookType,
} from "../../src";

function runTest(handle: boolean, afterNext: boolean) {
  test(`exception hook ${handle} ${afterNext}`, async function () {
    const res = await new TestStartup()
      .hook((ctx, exception) => {
        ctx.ok({
          message: exception.message,
        });
        return handle;
      }, HookType.Exception)
      .use(async (ctx, next) => {
        if (!afterNext) {
          throw new NotFoundException();
        }
        await next();
        if (afterNext) {
          throw new NotFoundException();
        }
      })
      .use((ctx) => {
        ctx.setHeader("h", 1);
      })
      .run();

    expect(res.status).toBe(handle ? 200 : 404);
    expect(res.body).toEqual(
      handle
        ? {
            message: getReasonPhrase(404),
          }
        : {
            message: getReasonPhrase(404),
            status: 404,
          }
    );
    expect(res.getHeader("h")).toBe(afterNext ? "1" : undefined);
  });
}

runTest(true, true);
runTest(true, false);
runTest(false, true);
runTest(false, false);
