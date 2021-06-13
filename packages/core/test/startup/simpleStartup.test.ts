import { HttpContext, Request, SimpleStartup } from "../../src";

test("simple startup", async function () {
  let context!: HttpContext;
  await new SimpleStartup()
    .use(async (ctx) => {
      context = ctx;
    })
    .run();

  expect(context).not.toBeUndefined();
  expect(context.req).not.toBeUndefined();
  expect(context.res).not.toBeUndefined();
});

test("without md", async function () {
  const res = await new SimpleStartup().run(new Request());

  expect(res).not.toBeUndefined();
});
