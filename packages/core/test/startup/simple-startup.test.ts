import { HttpContext, SfaRequest, TestStartup } from "../../src";

test("simple startup", async function () {
  let context!: HttpContext;
  await new TestStartup()
    .use(async (ctx) => {
      context = ctx;
    })
    .run();

  expect(context).not.toBeUndefined();
  expect(context.req).not.toBeUndefined();
  expect(context.res).not.toBeUndefined();
});

test("without md", async function () {
  const res = await new TestStartup().run(new SfaRequest());

  expect(res).not.toBeUndefined();
});
