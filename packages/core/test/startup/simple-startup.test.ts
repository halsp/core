import { Context } from "../../src";
import { TestStartup } from "../test-startup";

test("simple startup", async () => {
  let context!: Context;
  await new TestStartup()
    .use(async (ctx) => {
      context = ctx;
    })
    .run();

  expect(context).not.toBeUndefined();
});

test("without md", async () => {
  const ctx = await new TestStartup().run();

  expect(ctx).not.toBeUndefined();
});
