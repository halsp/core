import { Request } from "@ipare/core";
import { TestStartup } from "../src";

it("default status is 404", async () => {
  const res = await new TestStartup().run();
  expect(res.status).toBe(404);
});

it("status shound be 500 if skip throw error", async () => {
  const res = await new TestStartup()
    .skipThrow()
    .setRequest(new Request())
    .use(() => {
      throw new Error("err");
    })
    .run();
  expect(res.body).toEqual({
    status: 500,
    message: "err",
  });
  expect(res.status).toBe(500);
});

it("error shound be throw", async () => {
  let errMsg: string | undefined;
  try {
    await new TestStartup()
      .use(() => {
        throw new Error("err");
      })
      .run();
  } catch (err) {
    errMsg = (err as Error).message;
  }
  expect(errMsg).toBe("err");
});
